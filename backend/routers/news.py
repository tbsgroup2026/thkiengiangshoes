"""
TBS II - News & Announcements Router
Tin tức tập đoàn, bảng tin nội bộ, thông cáo báo chí.
Public: xem danh sách, chi tiết, filter theo category.
Admin/Office: tạo, sửa, xóa bài viết.
"""
import datetime
import re
import unicodedata
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import News, NewsCategory, Branch, Sector, User, RoleEnum
from schemas import (
    NewsItemOut, NewsListOut, NewsCreate, NewsUpdate, NewsCategoryOut
)
from auth import get_current_user, require_role, log_audit_event
from validators import sanitize_html_input, has_script_tag

router = APIRouter(prefix="/api/v1/news", tags=["News & Announcements"])


# ============================================================
# HELPER: Tạo slug từ tiếng Việt
# ============================================================
def generate_slug(text: str) -> str:
    """Chuyển tiếng Việt có dấu thành slug URL-safe."""
    # Chuẩn hóa unicode
    text = unicodedata.normalize('NFKD', text)
    # Bỏ dấu
    text = ''.join(c for c in text if not unicodedata.combining(c))
    # Lowercase, chỉ giữ chữ cái/số/khoảng trắng/dấu gạch
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')[:200]


# ============================================================
# PUBLIC ENDPOINTS (không yêu cầu đăng nhập)
# ============================================================

@router.get("/categories", response_model=List[NewsCategoryOut])
def get_categories(db: Session = Depends(get_db)):
    """Public: Danh sách danh mục tin tức (kèm số bài)."""
    cats = db.query(NewsCategory).order_by(NewsCategory.sort_order).all()
    result = []
    for c in cats:
        count = db.query(News).filter(
            News.category_id == c.id,
            News.is_published == True
        ).count()
        result.append(NewsCategoryOut(
            id=c.id, name=c.name, slug=c.slug,
            description=c.description, icon=c.icon, color=c.color,
            sort_order=c.sort_order, created_at=c.created_at,
            news_count=count
        ))
    return result


@router.get("", response_model=dict)
def get_news_list(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    category_slug: Optional[str] = None,
    branch_id: Optional[int] = None,
    sector_id: Optional[int] = None,
    search: Optional[str] = None,
    featured_only: bool = False,
    db: Session = Depends(get_db)
):
    """
    Public: Danh sách tin tức có phân trang, filter, search.
    """
    query = db.query(News).filter(News.is_published == True)

    if category_slug:
        cat = db.query(NewsCategory).filter(NewsCategory.slug == category_slug).first()
        if cat:
            query = query.filter(News.category_id == cat.id)

    if branch_id:
        query = query.filter(News.branch_id == branch_id)
    if sector_id:
        query = query.filter(News.sector_id == sector_id)
    if featured_only:
        query = query.filter(News.is_featured == True)
    if search:
        query = query.filter(
            (News.title.ilike(f"%{search}%")) |
            (News.summary.ilike(f"%{search}%")) |
            (News.tags.ilike(f"%{search}%"))
        )

    total = query.count()
    total_pages = max(1, (total + limit - 1) // limit)

    news = query.order_by(
        News.is_featured.desc(),
        News.published_at.desc()
    ).offset((page - 1) * limit).limit(limit).all()

    items = []
    for n in news:
        items.append(NewsListOut(
            id=n.id, title=n.title, slug=n.slug, summary=n.summary,
            category_id=n.category_id,
            category_name=n.category.name if n.category else None,
            category_slug=n.category.slug if n.category else None,
            category_color=n.category.color if n.category else None,
            featured_image=n.featured_image, tags=n.tags,
            is_featured=n.is_featured, view_count=n.view_count,
            source_name=n.source_name,
            published_at=n.published_at, created_at=n.created_at
        ))

    return {
        "items": items,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": total_pages
        }
    }


@router.get("/featured", response_model=List[NewsListOut])
def get_featured_news(limit: int = Query(5, ge=1, le=20), db: Session = Depends(get_db)):
    """Public: Tin nổi bật (featured)."""
    news = db.query(News).filter(
        News.is_published == True,
        News.is_featured == True
    ).order_by(News.published_at.desc()).limit(limit).all()

    result = []
    for n in news:
        result.append(NewsListOut(
            id=n.id, title=n.title, slug=n.slug, summary=n.summary,
            category_id=n.category_id,
            category_name=n.category.name if n.category else None,
            category_slug=n.category.slug if n.category else None,
            category_color=n.category.color if n.category else None,
            featured_image=n.featured_image, tags=n.tags,
            is_featured=n.is_featured, view_count=n.view_count,
            source_name=n.source_name,
            published_at=n.published_at, created_at=n.created_at
        ))
    return result


@router.get("/{slug}", response_model=NewsItemOut)
def get_news_detail(slug: str, db: Session = Depends(get_db)):
    """Public: Chi tiết bài viết (tăng view count)."""
    news = db.query(News).filter(
        News.slug == slug,
        News.is_published == True
    ).first()
    if not news:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết")

    # Tăng view count
    news.view_count = (news.view_count or 0) + 1
    db.commit()

    return NewsItemOut(
        id=news.id, title=news.title, slug=news.slug,
        summary=news.summary, content=news.content,
        category_id=news.category_id,
        category_name=news.category.name if news.category else None,
        category_slug=news.category.slug if news.category else None,
        category_color=news.category.color if news.category else None,
        branch_id=news.branch_id,
        branch_name=news.branch.name if news.branch else None,
        sector_id=news.sector_id,
        sector_name=news.sector.name if news.sector else None,
        author_id=news.author_id,
        author_name=news.author.name if news.author else None,
        featured_image=news.featured_image, tags=news.tags,
        is_featured=news.is_featured, is_published=news.is_published,
        view_count=news.view_count,
        source_url=news.source_url, source_name=news.source_name,
        published_at=news.published_at,
        created_at=news.created_at, updated_at=news.updated_at
    )


# ============================================================
# ADMIN ENDPOINTS (yêu cầu đăng nhập + quyền)
# ============================================================

@router.post("", response_model=NewsItemOut, status_code=status.HTTP_201_CREATED)
def create_news(
    req: NewsCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([RoleEnum.ADMIN, RoleEnum.OFFICE, RoleEnum.MANAGER]))
):
    """Admin: Tạo bài viết mới."""
    # Validate input
    if has_script_tag(req.title) or has_script_tag(req.content):
        raise HTTPException(status_code=400, detail="Nội dung chứa mã không hợp lệ")

    # Tạo slug unique
    base_slug = generate_slug(req.title)
    slug = base_slug
    counter = 1
    while db.query(News).filter(News.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    news = News(
        title=sanitize_html_input(req.title),
        slug=slug,
        summary=sanitize_html_input(req.summary or ""),
        content=req.content,  # Giữ HTML để hiển thị rich text
        category_id=req.category_id,
        branch_id=req.branch_id or current_user.branch_id,
        sector_id=req.sector_id or current_user.sector_id,
        author_id=current_user.id,
        featured_image=req.featured_image,
        tags=req.tags,
        is_featured=req.is_featured or False,
        is_published=req.is_published if req.is_published is not None else True,
        source_url=req.source_url,
        source_name=req.source_name,
        published_at=req.published_at or datetime.datetime.utcnow(),
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.add(news)
    db.commit()
    db.refresh(news)

    log_audit_event(
        db, current_user.id, "CREATE_NEWS", "News",
        f"Tạo bài viết: {news.title}"
    )

    return NewsItemOut(
        id=news.id, title=news.title, slug=news.slug,
        summary=news.summary, content=news.content,
        category_id=news.category_id,
        category_name=news.category.name if news.category else None,
        category_slug=news.category.slug if news.category else None,
        category_color=news.category.color if news.category else None,
        branch_id=news.branch_id,
        branch_name=news.branch.name if news.branch else None,
        sector_id=news.sector_id,
        sector_name=news.sector.name if news.sector else None,
        author_id=news.author_id,
        author_name=current_user.name,
        featured_image=news.featured_image, tags=news.tags,
        is_featured=news.is_featured, is_published=news.is_published,
        view_count=0,
        source_url=news.source_url, source_name=news.source_name,
        published_at=news.published_at,
        created_at=news.created_at, updated_at=news.updated_at
    )


@router.put("/{news_id}", response_model=NewsItemOut)
def update_news(
    news_id: int,
    req: NewsUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([RoleEnum.ADMIN, RoleEnum.OFFICE, RoleEnum.MANAGER]))
):
    """Admin: Cập nhật bài viết."""
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết")

    # Update fields
    if req.title is not None:
        news.title = sanitize_html_input(req.title)
        # Tạo slug mới nếu title thay đổi
        new_slug = generate_slug(req.title)
        if new_slug != news.slug:
            counter = 1
            slug = new_slug
            while db.query(News).filter(News.slug == slug, News.id != news.id).first():
                slug = f"{new_slug}-{counter}"
                counter += 1
            news.slug = slug
    if req.summary is not None:
        news.summary = sanitize_html_input(req.summary)
    if req.content is not None:
        news.content = req.content
    if req.category_id is not None:
        news.category_id = req.category_id
    if req.branch_id is not None:
        news.branch_id = req.branch_id
    if req.sector_id is not None:
        news.sector_id = req.sector_id
    if req.featured_image is not None:
        news.featured_image = req.featured_image
    if req.tags is not None:
        news.tags = req.tags
    if req.is_featured is not None:
        news.is_featured = req.is_featured
    if req.is_published is not None:
        news.is_published = req.is_published
    if req.source_url is not None:
        news.source_url = req.source_url
    if req.source_name is not None:
        news.source_name = req.source_name
    if req.published_at is not None:
        news.published_at = req.published_at

    news.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(news)

    log_audit_event(
        db, current_user.id, "UPDATE_NEWS", "News",
        f"Cập nhật bài viết #{news.id}: {news.title}"
    )

    return NewsItemOut(
        id=news.id, title=news.title, slug=news.slug,
        summary=news.summary, content=news.content,
        category_id=news.category_id,
        category_name=news.category.name if news.category else None,
        category_slug=news.category.slug if news.category else None,
        category_color=news.category.color if news.category else None,
        branch_id=news.branch_id,
        branch_name=news.branch.name if news.branch else None,
        sector_id=news.sector_id,
        sector_name=news.sector.name if news.sector else None,
        author_id=news.author_id,
        author_name=news.author.name if news.author else None,
        featured_image=news.featured_image, tags=news.tags,
        is_featured=news.is_featured, is_published=news.is_published,
        view_count=news.view_count,
        source_url=news.source_url, source_name=news.source_name,
        published_at=news.published_at,
        created_at=news.created_at, updated_at=news.updated_at
    )


@router.delete("/{news_id}")
def delete_news(
    news_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([RoleEnum.ADMIN]))
):
    """Admin: Xóa bài viết (chỉ ADMIN)."""
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết")

    title = news.title
    db.delete(news)
    db.commit()

    log_audit_event(
        db, current_user.id, "DELETE_NEWS", "News",
        f"Xóa bài viết #{news_id}: {title}"
    )

    return {"message": "Đã xóa bài viết", "news_id": news_id, "title": title}


# ============================================================
# SEED DATA: Danh mục & Tin tức thực tế về TBS Group
# ============================================================

def seed_news_data(db: Session):
    """Khởi tạo danh mục và bài viết tin tức TBS Group."""
    if db.query(NewsCategory).count() > 0:
        return

    print("[TBS NEWS] Seeding news categories & articles from TBS Group...")

    # ---- Danh mục ----
    categories = [
        NewsCategory(name="Tin Tập đoàn", slug="tin-tap-doan", description="Tin tức chung về TBS Group", icon="🏢", color="#1a56db", sort_order=1),
        NewsCategory(name="Sản xuất Công nghiệp", slug="san-xuat-cong-nghiep", description="Ngành sản xuất giày dép & túi xách", icon="🏭", color="#059669", sort_order=2),
        NewsCategory(name="Đối tác Chiến lược", slug="doi-tac-chien-luoc", description="Hợp tác quốc tế & đối tác toàn cầu", icon="🤝", color="#7c3aed", sort_order=3),
        NewsCategory(name="Sự kiện & Hội thảo", slug="su-kien-hoi-thao", description="Hội nghị, hội thảo, sự kiện nổi bật", icon="📅", color="#dc2626", sort_order=4),
        NewsCategory(name="Phát triển Bền vững", slug="phat-trien-ben-vung", description="Môi trường, trách nhiệm xã hội, an toàn lao động", icon="🌱", color="#0891b2", sort_order=5),
        NewsCategory(name="Nội bộ & Văn hóa", slug="noi-bo-van-hoa", description="Hoạt động nội bộ, thể thao, học bổng", icon="🎉", color="#f59e0b", sort_order=6),
        NewsCategory(name="Công nghệ & Đổi mới", slug="cong-nghe-doi-moi", description="Chuyển đổi số, R&D, Innovation", icon="🚀", color="#4f46e5", sort_order=7),
        NewsCategory(name="Bất động sản & Hạ tầng", slug="bat-dong-san-ha-tang", description="Dự án BĐS, khu công nghiệp", icon="🏗️", color="#b45309", sort_order=8),
    ]
    db.add_all(categories)
    db.commit()

    # Lấy categories đã tạo
    cat_tapdoan = db.query(NewsCategory).filter(NewsCategory.slug == "tin-tap-doan").first()
    cat_sanxuat = db.query(NewsCategory).filter(NewsCategory.slug == "san-xuat-cong-nghiep").first()
    cat_doitac = db.query(NewsCategory).filter(NewsCategory.slug == "doi-tac-chien-luoc").first()
    cat_sukien = db.query(NewsCategory).filter(NewsCategory.slug == "su-kien-hoi-thao").first()
    cat_benvung = db.query(NewsCategory).filter(NewsCategory.slug == "phat-trien-ben-vung").first()
    cat_noibo = db.query(NewsCategory).filter(NewsCategory.slug == "noi-bo-van-hoa").first()
    cat_congnghe = db.query(NewsCategory).filter(NewsCategory.slug == "cong-nghe-doi-moi").first()
    cat_bds = db.query(NewsCategory).filter(NewsCategory.slug == "bat-dong-san-ha-tang").first()

    admin = db.query(User).filter(User.emp_code == "ADMIN").first()
    admin_id = admin.id if admin else None

    # ---- 30+ Bài viết thực tế ----
    today = datetime.datetime.utcnow()

    def make_news(cat, title, summary, content, tags="", featured=False, days_ago=0, source_url="", source_name="TBS Group"):
        base_slug = generate_slug(title)
        slug = base_slug
        c = 1
        while db.query(News).filter(News.slug == slug).first():
            slug = f"{base_slug}-{c}"; c += 1
        pub_date = today - datetime.timedelta(days=days_ago)
        return News(
            title=title, slug=slug, summary=summary, content=content,
            category_id=cat.id, author_id=admin_id, tags=tags,
            is_featured=featured, is_published=True, view_count=0,
            source_url=source_url, source_name=source_name,
            published_at=pub_date, created_at=pub_date, updated_at=pub_date
        )

    articles = [
        # === TIN TẬP ĐOÀN ===
        make_news(cat_tapdoan,
            "TBS Group tổ chức Hội nghị Tổng kết 6 tháng đầu năm 2026",
            "Ngày 11/7/2026, TBS Group tổ chức Hội nghị Tổng kết 6 tháng đầu năm và triển khai kế hoạch 6 tháng cuối năm 2026 cho ngành Sản xuất Công nghiệp.",
            "<p>Ngày 11/7/2026, tại văn phòng trụ sở, TBS Group đã tổ chức thành công <strong>Hội nghị Tổng kết 6 tháng đầu năm và triển khai kế hoạch 6 tháng cuối năm 2026</strong> cho ngành Sản xuất Công nghiệp.</p><p>Hội nghị có sự tham dự của Ban Lãnh đạo Tập đoàn, Ban Giám đốc các nhà máy thành viên, cùng đại diện các phòng ban chức năng.</p><p>Hội nghị đã điểm lại những kết quả nổi bật trong 6 tháng đầu năm, đồng thời đề ra các mục tiêu và giải pháp trọng tâm cho giai đoạn cuối năm 2026.</p>",
            "tong-ket,2026,san-xuat", True, 9,
            "https://www.tbsgroup.vn/press-center/tbs-group-to-chuc-hoi-nghi-tong-ket-6-thang-dau-nam-va-trien-khai-ke-hoach-6-thang-cuoi-nam-2026-nganh-san-xuat-cong-nghiep/"),

        make_news(cat_tapdoan,
            "Lãnh đạo TP.HCM thăm và làm việc đầu Xuân Bính Ngọ 2026 tại TBS Group",
            "Ngày 24/2/2026, TBS Group vinh dự tiếp đón đoàn Lãnh đạo Thành ủy và UBND TP.HCM đến thăm và làm việc nhân dịp đầu năm mới.",
            "<p>Ngày 24/2/2026 (mùng 8 Tết Bính Ngọ), <strong>TBS Group đã vinh dự tiếp đón đoàn Lãnh đạo Thành ủy và UBND TP.HCM</strong> đến thăm, chúc Tết và làm việc tại trụ sở chính của Tập đoàn.</p><p>Buổi gặp mặt thể hiện sự quan tâm sâu sắc của lãnh đạo thành phố đối với cộng đồng doanh nghiệp, ghi nhận những đóng góp quan trọng của TBS Group vào sự phát triển kinh tế - xã hội.</p>",
            "tp-hcm,lanh-dao,tet-2026", True, 170,
            "https://www.tbsgroup.vn/press-center/tbs-group-tiep-don-lanh-dao-thanh-uy-va-ubnd-tp-hcm-den-tham-lam-viec-dau-xuan-binh-ngo-2026/"),

        make_news(cat_tapdoan,
            "Hành trình 30 năm TBS Group: Từ xưởng nhỏ đến tập đoàn đa ngành toàn cầu",
            "Từ những ngày đầu thành lập năm 1989, TBS Group đã vươn mình trở thành một trong những tập đoàn đa ngành hàng đầu Việt Nam với gần 50.000 nhân sự.",
            "<p>Thành lập năm <strong>1989</strong> bởi ba nhà sáng lập Nguyễn Đức Thuấn, Cao Thanh Bích và Nguyễn Thanh Sơn, TBS Group đã trải qua hơn 3 thập kỷ phát triển bền bỉ.</p><p>Từ dự án Nhà máy số 1 năm 1992, đến nay TBS đã có mặt trong <strong>6 lĩnh vực</strong> cốt lõi: Sản xuất giày dép, Túi xách, Bất động sản & Hạ tầng CN, Cảng & Logistics, Du lịch, Thương mại & Dịch vụ.</p><p>Các cột mốc quan trọng:</p><ul><li><strong>2002:</strong> Cán mốc 5 triệu đôi giày</li><li><strong>2014:</strong> Đạt 21 triệu đôi giày & 10 triệu túi xách - Huân chương Lao động Hạng I</li><li><strong>2026:</strong> Top 5 chuỗi sản xuất toàn cầu, đối tác chiến lược của Decathlon, Skechers, Coach...</li></ul>",
            "lich-su,30-nam,thanh-tuu", True, 200,
            "https://www.tbsgroup.vn/ve-tap-doan-tbs/lich-su-phat-trien/"),

        # === SẢN XUẤT CÔNG NGHIỆP ===
        make_news(cat_sanxuat,
            "TBS Group cán mốc 21 triệu đôi giày và 10 triệu túi xách mỗi năm",
            "Với 33 dây chuyền sản xuất và 25.000 công nhân, TBS Group là một trong những nhà sản xuất giày dép & túi xách hàng đầu thế giới.",
            "<p>TBS Group hiện vận hành <strong>33 dây chuyền sản xuất</strong> với <strong>25.000 công nhân</strong>, đạt công suất <strong>21 triệu đôi giày/năm</strong> và <strong>10 triệu túi xách/năm</strong>.</p><p>Các nhà máy trọng điểm trải dài khắp cả nước: <strong>Văn Phòng Chuỗi SKECHERS, TBS Kiên Giang, TBS Sông Trà, TBS Đồng Xoài, TBS Miền Trung</strong>.</p><p>Sản phẩm được xuất khẩu sang hơn 50 quốc gia, phục vụ các thương hiệu hàng đầu như Decathlon, Skechers, Reebok, Coach, Tory Burch, Lancaster.</p>",
            "san-xuat,giay-dep,tui-xach,21-trieu", True, 30,
            "https://www.tbsgroup.vn/linh-vuc-hoat-dong/linh-vuc-giay-da/"),

        make_news(cat_sanxuat,
            "Văn Phòng Chuỗi SKECHERS: 8 năm kiến tạo & phát triển bền vững",
            "Từ năm 2017, Văn Phòng Chuỗi SKECHERS đã phát triển thành cụm nhà máy hiện đại với 5.000 nhân sự, công suất 10 triệu đôi giày/năm, là đối tác chiến lược quốc tế.",
            "<p>Tọa lạc tại vị trí chiến lược, <strong>Văn Phòng Chuỗi SKECHERS</strong> là một trong những cơ sở sản xuất giày trọng điểm của TBS Group.</p><p><strong>Các con số ấn tượng:</strong></p><ul><li>8 năm phát triển (2017-2025)</li><li>2 nhà máy hiện đại</li><li>5.000 nhân sự</li><li>Công suất 10 triệu đôi giày/năm</li></ul><p>Năm 2018, đôi giày đầu tiên ra đời tại đây, đánh dấu bước ngoặt quan trọng. Hiện nhà máy đang trong giai đoạn chuyển đổi số theo hướng công nghiệp 4.0.</p>",
            "skechers,decathlon,8-nam", True, 60,
            "https://tbs-thoaisonshoes.com/"),

        make_news(cat_sanxuat,
            "ISO 9001:2015: TBS Group chuẩn hóa hệ thống quản trị vận hành",
            "Phòng Quản lý Chất lượng chuỗi giày Decathlon phối hợp cùng TBS An Giang và Bureau Veritas tổ chức đào tạo về Hệ thống Quản lý Chất lượng theo tiêu chuẩn ISO 9001:2015.",
            "<p>Tháng 6/2026, Phòng Quản lý Chất lượng chuỗi giày Decathlon đã phối hợp cùng <strong>TBS An Giang</strong> và tổ chức <strong>Bureau Veritas</strong> tổ chức khóa đào tạo chuyên sâu về <strong>Hệ thống Quản lý Chất lượng theo tiêu chuẩn ISO 9001:2015</strong>.</p><p>Đây là bước tiến quan trọng trong lộ trình chuẩn hóa quy trình sản xuất, nâng cao chất lượng sản phẩm và đáp ứng các yêu cầu khắt khe của thị trường quốc tế.</p>",
            "iso-9001,chat-luong,decathlon,bureau-veritas", False, 54,
            "https://www.tbsgroup.vn/press-center/tbs-group-chuan-hoa-he-thong-quan-tri-van-hanh-theo-tieu-chuan-quoc-te-iso-90012015/"),

        # === ĐỐI TÁC CHIẾN LƯỢC ===
        make_news(cat_doitac,
            "Kỷ niệm 30 năm hợp tác chiến lược TBS Group & Decathlon (1996-2026)",
            "Tại khách sạn Mai House Saigon, TBS Group long trọng tổ chức Lễ kỷ niệm 30 năm hợp tác với Decathlon - đối tác đã đồng hành và kiến tạo giá trị bền vững.",
            "<p>Ngày 22/5/2026, tại <strong>khách sạn Mai House Saigon</strong>, TBS Group đã long trọng tổ chức <strong>Lễ kỷ niệm 30 năm hợp tác chiến lược với Decathlon (1996-2026)</strong>.</p><p><strong>Những con số ấn tượng:</strong></p><ul><li><strong>40%</strong> tổng năng lực sản xuất của TBS dành riêng cho Decathlon</li><li><strong>38%</strong> sản phẩm giày toàn cầu của Decathlon do đội ngũ R&D TBS phát triển</li><li>Lead time giảm từ <strong>42 ngày</strong> xuống <strong>22 ngày</strong>, hướng tới <strong>16 ngày</strong></li><li>Đầu tư <strong>70 triệu Euro</strong> vào năng lượng sạch</li><li>Cam kết giảm <strong>40%</strong> phát thải carbon (SBTi)</li></ul><p>Ông Nguyễn Đức Thuấn - Chủ tịch TBS Group nhấn mạnh: <em>'Đây là bệ phóng vững chắc đưa TBS vươn lên TOP 5 trong chuỗi sản xuất toàn cầu.'</em></p>",
            "decathlon,30-nam,doi-tac-chien-luoc,ky-niem", True, 60,
            "https://www.tbsgroup.vn/press-center/ky-niem-30-nam-hop-tac-chien-luoc-tbs-group-decathlon-dong-hanh-phat-trien-va-kien-tao-gia-tri-ben-vung/"),

        make_news(cat_doitac,
            "TBS Group mở rộng hợp tác với Skechers, Coach, Reebok và các thương hiệu toàn cầu",
            "Bên cạnh Decathlon, TBS Group đã và đang là đối tác sản xuất chiến lược của hàng loạt thương hiệu thời trang và thể thao hàng đầu thế giới.",
            "<p>Trong chiến lược mở rộng thị trường, TBS Group đã thiết lập quan hệ đối tác với nhiều thương hiệu toàn cầu:</p><ul><li><strong>Skechers</strong> - Thương hiệu giày thể thao Mỹ</li><li><strong>Coach</strong> - Thương hiệu túi xách cao cấp</li><li><strong>Tory Burch</strong> - Thương hiệu thời trang luxury</li><li><strong>Lancaster</strong> - Thương hiệu túi xách Pháp</li><li><strong>Reebok</strong> - Thương hiệu thể thao toàn cầu</li><li><strong>Wolverine</strong> - Thương hiệu giày outdoor Mỹ</li></ul><p>Mỗi đối tác đều có dây chuyền và nhà máy chuyên biệt, đảm bảo tiêu chuẩn chất lượng riêng.</p>",
            "skechers,coach,reebok,doi-tac,toan-cau", False, 90,
            "https://www.tbsgroup.vn/linh-vuc-hoat-dong/"),

        make_news(cat_doitac,
            "TBS Group khảo sát Jinjiang (Trung Quốc), lên kế hoạch trung tâm trưng bày giày tại TP.HCM",
            "Tháng 1/2026, TBS Group đến khảo sát tại Jinjiang International Shoe Textile City, lên kế hoạch xây dựng trung tâm trưng bày giày dép tại TP.HCM và hợp tác với SHEIN.",
            "<p>Tháng 1/2026, đoàn công tác TBS Group đã đến khảo sát tại <strong>Jinjiang International Shoe Textile City</strong> (Trung Quốc) - trung tâm nguyên phụ liệu giày dép lớn nhất thế giới.</p><p>Mục tiêu chuyến đi bao gồm: xây dựng trung tâm trưng bày giày dép tại TP.HCM, kết nối với nền tảng thương mại điện tử <strong>SHEIN</strong>, và mở rộng chuỗi cung ứng nguyên phụ liệu.</p>",
            "jinjiang,trung-quoc,shein,tp-hcm", False, 180,
            "https://jjjjb.fjdaily.com/pc/con/202601/24/content_508719.html"),

        # === SỰ KIỆN & HỘI THẢO ===
        make_news(cat_sukien,
            "TBS Innovation Summit 2026: Động lực số hóa và chiến lược nâng tầm vị thế toàn cầu",
            "Ngày 20/6/2026, Ngành Sản xuất Công nghiệp TBS Group tổ chức Hội thảo Khoa học Công nghệ lần 1 - TBS Innovation Summit 2026.",
            "<p>Ngày 20/6/2026, Ngành Sản xuất Công nghiệp TBS Group đã tổ chức thành công <strong>Hội thảo Khoa học Công nghệ lần 1 - TBS Innovation Summit 2026</strong> với chủ đề: 'Động lực số hóa và chiến lược nâng tầm vị thế toàn cầu'.</p><p>Hội thảo tập trung vào các nội dung chính:</p><ul><li>Xu hướng số hóa trong ngành sản xuất giày dép - túi xách</li><li>Ứng dụng AI và IoT trong quản lý sản xuất</li><li>Chiến lược phát triển bền vững và kinh tế tuần hoàn</li><li>Nâng cao năng lực R&D để dẫn đầu chuỗi cung ứng</li></ul>",
            "innovation-summit,so-hoa,2026,cong-nghe", True, 32,
            "https://www.tbsgroup.vn/press-center/hoi-thao-khoa-hoc-cong-nghe-tbs-lan-1-tbs-innovation-summit-2026-dong-luc-so-hoa-va-chien-luoc-nang-tam-vi-the-toan-cau/"),

        make_news(cat_sukien,
            "TBS Group tiếp Đoàn công tác Bộ Công Thương làm việc tại trụ sở",
            "Ngày 10/4/2026, TBS Group và Lefaso đã phối hợp tiếp đón Đoàn công tác Bộ Công Thương đến thăm và làm việc tại trụ sở chính.",
            "<p>Ngày 10/4/2026, TBS Group phối hợp cùng <strong>Hiệp hội Da giày - Túi xách Việt Nam (Lefaso)</strong> tiếp đón và làm việc với <strong>Đoàn công tác Bộ Công Thương</strong> tại trụ sở chính.</p><p>Buổi làm việc tập trung vào định hướng phát triển ngành da giày Việt Nam giai đoạn 2026-2035, các chính sách hỗ trợ doanh nghiệp và chiến lược xuất khẩu bền vững.</p>",
            "bo-cong-thuong,lefaso,da-giay,2026", False, 105,
            "https://www.tbsgroup.vn/press-center/tbs-group-va-hiep-hoi-da-giay-tui-xach-viet-nam-tiep-doan-cong-tac-bo-cong-thuong/"),

        make_news(cat_sukien,
            "RECAP: TBS Kiên Giang tổ chức chuỗi hoạt động kỷ niệm 10 năm thành lập",
            "Hơn một thập kỷ phát triển, TBS Kiên Giang đã từng bước khẳng định vai trò là mắt xích quan trọng trong hệ sinh thái sản xuất của TBS Group.",
            "<p>Tháng 3/2026, <strong>TBS Kiên Giang</strong> đã tổ chức chuỗi hoạt động kỷ niệm <strong>10 năm thành lập</strong> với nhiều hoạt động ý nghĩa: lễ tri ân, hội thao, chương trình văn nghệ, và trao học bổng cho con em người lao động.</p><p>Sau 10 năm, từ một nhà máy non trẻ, TBS Kiên Giang đã phát triển thành một trong những cơ sở sản xuất giày chủ lực của Tập đoàn.</p>",
            "kien-giang,10-nam,ky-niem,thanh-lap", False, 132,
            "https://www.tbsgroup.vn/press-center/recap-tbs-kien-giang-to-chuc-chuoi-hoat-dong-ky-niem-10-nam-thanh-lap/"),

        make_news(cat_sukien,
            "Giải vô địch Câu lạc bộ Montgomerie Links 2025: Mốc son 15 năm",
            "Giải Vô địch Câu lạc bộ Montgomerie Links 2025 chính thức khởi tranh vào ngày 24/8/2025, đánh dấu 15 năm một giải đấu thường niên gắn liền với các dự án cộng đồng.",
            "<p>Ngày 24/8/2025, <strong>Giải Vô địch Câu lạc bộ Montgomerie Links 2025</strong> đã chính thức khởi tranh, đánh dấu cột mốc <strong>15 năm</strong> của giải đấu thường niên danh giá.</p><p>Sân golf Montgomerie Links thuộc hệ sinh thái du lịch - nghỉ dưỡng của TBS Group, là một trong những sân golf hàng đầu Việt Nam và khu vực.</p>",
            "montgomerie-links,golf,15-nam,du-lich", False, 340,
            "https://www.tbsgroup.vn/press-center/giai-vo-dich-cau-lac-bo-montgomerie-links-2025-moc-son-15-nam-khang-dinh-vi-the-va-lan-toa-gia-tri-cong-dong/"),

        # === PHÁT TRIỂN BỀN VỮNG ===
        make_news(cat_benvung,
            "9.749 suất học bổng Khuyến học TBS Group 2025: Vun đắp truyền thống, thắp sáng tương lai",
            "Công đoàn TBS Group khởi động chương trình Học bổng Khuyến học 2024-2025 với 9.749 suất trị giá hơn 9,6 tỷ đồng cho con em người lao động.",
            "<p>Ngày 15/8/2025, <strong>Công đoàn TBS Group</strong> chính thức khởi động chương trình <strong>Học bổng Khuyến học 2024-2025</strong> với <strong>9.749 suất</strong> học bổng, tổng trị giá hơn <strong>9,6 tỷ đồng</strong>.</p><p>Đây là hoạt động thường niên thể hiện cam kết của TBS Group đối với cộng đồng, đầu tư cho thế hệ tương lai và chăm lo đời sống người lao động.</p>",
            "hoc-bong,khuyen-hoc,cong-doan,9-ty", True, 340,
            "https://www.tbsgroup.vn/press-center/hoc-bong-khuyen-hoc-tbs-group-2025-vun-dap-truyen-thong-thap-sang-tuong-lai/"),

        make_news(cat_benvung,
            "TBS Group đầu tư 70 triệu Euro vào năng lượng sạch và cam kết giảm 40% phát thải carbon",
            "Hướng tới mục tiêu phát triển bền vững, TBS Group đã đầu tư mạnh mẽ vào hệ thống điện mặt trời áp mái và các giải pháp sản xuất xanh.",
            "<p>Trong khuôn khổ cam kết với <strong>SBTi (Science Based Targets initiative)</strong>, TBS Group đã đầu tư hơn <strong>70 triệu Euro</strong> vào hệ thống năng lượng sạch, bao gồm điện mặt trời áp mái tại tất cả các nhà máy.</p><p>Mục tiêu: <strong>giảm 40% lượng phát thải carbon</strong> trong toàn bộ chuỗi sản xuất. Sản phẩm tiêu biểu từ nguyên liệu tái chế: dòng giày <strong>NH ONE</strong>.</p><p>TBS Group cũng đã triển khai <strong>Chương trình Lương Đủ Sống (Living Wage)</strong> nhằm đảm bảo mức sống công bằng cho toàn bộ người lao động.</p>",
            "nang-luong-sach,carbon,SBTi,living-wage,xanh", True, 100,
            "https://www.tbsgroup.vn/phat-trien-ben-vung/"),

        make_news(cat_benvung,
            "Văn Phòng Chuỗi SKECHERS trao 1.488 suất học bổng cho con em người lao động năm 2024",
            "SKECHERS - TBS Group đã trao 1.488 suất học bổng cho con em đoàn viên, người lao động có thành tích học tập xuất sắc.",
            "<p>Năm 2024, <strong>Văn Phòng Chuỗi SKECHERS - TBS Group</strong> đã tổ chức trao <strong>1.488 suất học bổng</strong> cho con em đoàn viên và người lao động đạt thành tích học tập xuất sắc trong năm học.</p><p>Đây là minh chứng cho cam kết của TBS Group đối với <strong>trách nhiệm xã hội</strong> và sự phát triển bền vững của cộng đồng địa phương nơi nhà máy hoạt động.</p>",
            "hoc-bong,skechers,1-488-suat", False, 500,
            "https://www.vietnam.vn/en/trao-1-488-suat-hoc-bong-cho-con-doan-vien-nguoi-lao-dong-cong-ty-co-phan-tbs-an-giang"),

        make_news(cat_benvung,
            "TBS Group với chiến lược Phát triển Bền vững toàn diện",
            "An toàn lao động, bảo vệ môi trường, và trách nhiệm xã hội là ba trụ cột trong chiến lược phát triển bền vững của TBS Group.",
            "<p>TBS Group xác định phát triển bền vững là nền tảng cho sự tăng trưởng dài hạn với 3 trụ cột chính:</p><ol><li><strong>Sức khỏe & An toàn lao động:</strong> Môi trường làm việc đạt chuẩn quốc tế, hệ thống quản lý an toàn chuyên nghiệp</li><li><strong>Bảo vệ môi trường:</strong> Hệ thống xử lý nước thải hiện đại, năng lượng tái tạo, giảm thiểu rác thải</li><li><strong>Trách nhiệm xã hội:</strong> Học bổng khuyến học, chương trình Living Wage, hỗ trợ cộng đồng</li></ol>",
            "phat-trien-ben-vung,an-toan,moi-truong,xa-hoi", False, 200,
            "https://www.tbsgroup.vn/phat-trien-ben-vung/"),

        # === NỘI BỘ & VĂN HÓA ===
        make_news(cat_noibo,
            "Hội thao TBS SOLE 2025 Mở rộng: Đoàn kết - Hợp tác - Phát triển",
            "Ngày 25/9/2025, Hội thao TBS SOLE 2025 đã diễn ra sôi nổi tại khuôn viên nhà máy trong KCN ST3 với sự tham gia của đông đảo CBCNV.",
            "<p>Ngày 25/9/2025, trong không khí sôi nổi và tràn đầy năng lượng, <strong>Hội thao TBS SOLE 2025 Mở rộng</strong> đã diễn ra tại khuôn viên nhà máy trong <strong>KCN ST3</strong>.</p><p>Với tinh thần 'Đoàn kết - Hợp tác - Phát triển', hội thao thu hút hàng trăm vận động viên tham gia tranh tài ở các bộ môn: bóng đá, cầu lông, kéo co, chạy tiếp sức...</p>",
            "hoi-thao,the-thao,SOLE-2025,doan-ket", False, 300,
            "https://www.tbsgroup.vn/press-center/hoi-thao-tbs-sole-2025-mo-rong-doan-ket-hop-tac-phat-trien/"),

        make_news(cat_noibo,
            "TBS Group thông báo lịch nghỉ Tết Nguyên Đán 2026",
            "TBS Group công bố lịch nghỉ Tết Nguyên Đán Bính Ngọ 2026 để các đối tác và CBCNV chủ động sắp xếp kế hoạch.",
            "<p>TBS Group trân trọng thông báo <strong>lịch nghỉ Tết Nguyên Đán Bính Ngọ 2026</strong> tới toàn thể CBCNV và Quý đối tác. Kỳ nghỉ kéo dài từ 28 tháng Chạp đến mùng 6 Tết, đảm bảo thời gian sum họp gia đình cho người lao động.</p>",
            "tet-2026,nghi-tet,thong-bao", False, 166,
            "https://www.tbsgroup.vn/press-center/tbs-group-thong-bao-lich-nghi-tet/"),

        # === CÔNG NGHỆ & ĐỔI MỚI ===
        make_news(cat_congnghe,
            "Khoa học công nghệ & Đổi mới sáng tạo: Tương lai của ngành da giày - túi xách Việt Nam",
            "Tái cấu trúc chuỗi cung ứng toàn cầu và yêu cầu phát triển bền vững đặt ra bài toán chuyển đổi cho ngành sản xuất thời trang Việt Nam.",
            "<p>Bài viết phân tích chuyên sâu về <strong>tương lai ngành da giày - túi xách Việt Nam</strong> trong bối cảnh mới:</p><ul><li>Sự tái cấu trúc chuỗi cung ứng toàn cầu sau đại dịch</li><li>Lợi thế nhân công giá rẻ không còn là ưu thế cạnh tranh chính</li><li>Yêu cầu phát triển bền vững và kinh tế tuần hoàn từ các thị trường khó tính</li><li>Cơ hội từ chuyển đổi số, AI, và tự động hóa</li></ul><p>TBS Group với 7 trung tâm R&D đang dẫn đầu xu hướng này tại Việt Nam.</p>",
            "khoa-hoc,doi-moi,tuong-lai,da-giay,chuyen-doi-so", True, 38,
            "https://www.tbsgroup.vn/press-center/khoa-hoc-cong-nghe-va-doi-moi-sang-tao-tuong-lai-cua-nganh-da-giay-tui-xach-viet-nam-trong-ky-nguyen-moi/"),

        make_news(cat_congnghe,
            "Văn Phòng Chuỗi SKECHERS trên hành trình chuyển đổi số - Xây dựng nhà máy thông minh",
            "Giai đoạn 2024-2025, Văn Phòng Chuỗi SKECHERS tập trung chuyển đổi số toàn diện: từ quản lý sản xuất, bảo trì dự đoán, đến báo cáo thời gian thực.",
            "<p>Văn Phòng Chuỗi SKECHERS đang trong giai đoạn <strong>chuyển đổi số mạnh mẽ</strong> theo hướng công nghiệp 4.0, với các hệ thống nội bộ được nâng cấp toàn diện:</p><ul><li><strong>Quản lý Nhân sự:</strong> Phân tích hiệu suất theo thời gian thực</li><li><strong>Kế hoạch Sản xuất:</strong> Tối ưu hóa và dự báo bằng AI</li><li><strong>Bảo trì Thông minh:</strong> Theo dõi máy móc, phân tích dự đoán sự cố</li><li><strong>Quản lý Chất lượng:</strong> Kiểm soát chất lượng toàn diện</li><li><strong>Báo cáo Trực quan:</strong> Dashboard thời gian thực</li></ul>",
            "chuyen-doi-so,nha-may-thong-minh,skechers,4.0", True, 150,
            "https://tbs-thoaisonshoes.com/"),

        make_news(cat_congnghe,
            "7 Trung tâm R&D của TBS Group: Động lực đổi mới cho ngành sản xuất",
            "TBS Group sở hữu 7 trung tâm Nghiên cứu & Phát triển, nơi 38% sản phẩm giày toàn cầu của Decathlon được phát triển.",
            "<p>Với <strong>7 trung tâm R&D</strong> trải dài khắp các nhà máy, TBS Group đã trở thành đối tác phát triển sản phẩm chiến lược, không chỉ đơn thuần là nhà sản xuất.</p><p><strong>38% sản phẩm giày dép toàn cầu của Decathlon</strong> được nghiên cứu và phát triển bởi đội ngũ kỹ sư TBS, phối hợp với các nhà thiết kế từ Pháp.</p><p>Đội ngũ R&D của TBS làm việc trên toàn bộ vòng đời sản phẩm: từ ý tưởng, thiết kế, tạo mẫu, thử nghiệm đến sản xuất hàng loạt.</p>",
            "R&D,nghien-cuu,phat-trien,7-trung-tam,decathlon", False, 180,
            "https://www.tbsgroup.vn/linh-vuc-hoat-dong/linh-vuc-giay-da/"),

        # === BẤT ĐỘNG SẢN & HẠ TẦNG ===
        make_news(cat_bds,
            "TBS Land ra mắt dự án Green Skyline tại Dĩ An, TP.HCM",
            "Dự án căn hộ Green Skyline của TBS Land tọa lạc tại Dĩ An, với mức giá từ 2,75 tỷ VND, dự kiến bàn giao cuối năm 2026.",
            "<p>Quý IV/2025, <strong>TBS Land</strong> - công ty con của TBS Group trong lĩnh vực bất động sản - đã chính thức ra mắt dự án <strong>Green Skyline</strong> tại Dĩ An, TP.HCM.</p><p>Dự án cung cấp căn hộ cao cấp với mức giá từ <strong>2,75 tỷ VND</strong>, dự kiến bàn giao vào <strong>cuối năm 2026</strong>. Green Skyline được thiết kế theo tiêu chuẩn xanh, tích hợp không gian sống hiện đại và bền vững.</p>",
            "tbs-land,green-skyline,di-an,can-ho,2026", False, 250,
            "https://www.tbsgroup.vn/linh-vuc-hoat-dong/dau-tu-quan-ly-ha-tang-cn/"),

        make_news(cat_bds,
            "ICD TBS Tân Vạn: Trung tâm logistics 220.000m² tại vùng kinh tế trọng điểm phía Nam",
            "Tọa lạc tại vị trí chiến lược trong tứ giác kinh tế phía Nam, ICD TBS Tân Vạn có công suất 60.000 containers, diện tích kho 220.000m².",
            "<p><strong>ICD TBS Tân Vạn</strong> là trung tâm logistics chiến lược của TBS Group, tọa lạc tại vị trí đắc địa trong <strong>tứ giác kinh tế phía Nam</strong> (TP.HCM - Bình Dương - Đồng Nai - Bà Rịa Vũng Tàu).</p><p><strong>Quy mô:</strong></p><ul><li>Diện tích kho: <strong>220.000 m²</strong></li><li>Công suất: <strong>60.000 containers</strong></li><li>Dịch vụ: kho bãi, vận tải, khai thuê hải quan, logistics tích hợp</li></ul>",
            "ICD,Tan-Van,logistics,cang,220000-m2", False, 300,
            "https://www.tbsgroup.vn/linh-vuc-hoat-dong/logistics-va-cang/"),

        make_news(cat_bds,
            "Chuỗi khách sạn Mai House Hotels & Resorts: Dấu ấn TBS trong ngành du lịch cao cấp",
            "TBS Group đầu tư và phát triển chuỗi khách sạn, resort và sân golf tại Việt Nam và Đông Nam Á, với thương hiệu Mai House.",
            "<p><strong>Mai House Hotels & Resorts</strong> là thương hiệu quản lý khách sạn & nghỉ dưỡng cao cấp thuộc TBS Group, hiện diện tại các điểm đến hàng đầu Việt Nam.</p><p>Danh mục đầu tư bao gồm: khách sạn 5 sao, resort nghỉ dưỡng, sân golf (Montgomerie Links), và các dự án du lịch tích hợp tại Việt Nam và Đông Nam Á.</p>",
            "mai-house,khach-san,resort,du-lich,golf", False, 280,
            "https://www.tbsgroup.vn/linh-vuc-hoat-dong/dich-vu-du-lich-va-khach-san/"),

        # --- Additional articles to reach 30+ ---
        make_news(cat_tapdoan,
            "TBS Group vinh dự đón nhận Huân chương Lao động Hạng Nhất",
            "Năm 2014, TBS Group được Chủ tịch nước trao tặng Huân chương Lao động Hạng Nhất - phần thưởng cao quý ghi nhận những đóng góp to lớn cho nền kinh tế.",
            "<p>Năm 2014, TBS Group vinh dự được <strong>Chủ tịch nước CHXHCN Việt Nam</strong> trao tặng <strong>Huân chương Lao động Hạng Nhất</strong> - phần thưởng cao quý nhất dành cho tập thể có thành tích đặc biệt xuất sắc.</p><p>Trước đó, năm 2005, Tập đoàn cũng đã được trao tặng Huân chương Lao động Hạng Nhì. Đây là sự ghi nhận xứng đáng cho hành trình phát triển bền bỉ và những đóng góp to lớn vào nền kinh tế quốc gia.</p>",
            "huan-chuong,lao-dong,hang-nhat,thanh-tuu", False, 3000,
            "https://www.tbsgroup.vn/ve-tap-doan-tbs/thanh-tuu-noi-bat/"),

        make_news(cat_congnghe,
            "ECCO - Thương hiệu giày comfort số 1 được phân phối độc quyền bởi TBS tại Việt Nam",
            "Trong lĩnh vực Thương mại & Dịch vụ, TBS Group là nhà phân phối chính thức của ECCO - thương hiệu giày comfort hàng đầu Đan Mạch tại thị trường Việt Nam.",
            "<p>Trong lĩnh vực <strong>Thương mại & Dịch vụ</strong>, TBS Group tự hào là nhà phân phối chính thức của <strong>ECCO</strong> - thương hiệu giày comfort hàng đầu đến từ Đan Mạch tại thị trường Việt Nam.</p><p>Với tốc độ tăng trưởng <strong>30% (năm 2014)</strong>, mảng phân phối bán lẻ của TBS Group tiếp tục mở rộng, mang đến cho người tiêu dùng Việt những sản phẩm chất lượng quốc tế.</p>",
            "ecco,thuong-mai,phan-phoi,ban-le", False, 400,
            "https://www.tbsgroup.vn/linh-vuc-hoat-dong/thuong-mai-va-dich-vu/"),

        make_news(cat_tapdoan,
            "TBS Group - Tầm nhìn và Sứ mệnh: 'Thế giới làm được, ắt ta sẽ làm được'",
            "Với tinh thần 'Nếu thế giới làm được, người Việt Nam cũng làm được', TBS Group không ngừng vươn tầm quốc tế, đưa công nghiệp Việt Nam hội nhập sâu vào chuỗi giá trị toàn cầu.",
            "<p><strong>Tầm nhìn:</strong> Trở thành tập đoàn đầu tư quốc tế đa ngành uy tín hàng đầu Việt Nam và khu vực.</p><p><strong>Sứ mệnh:</strong> Thúc đẩy hội nhập quốc tế, giúp công nghiệp Việt Nam gia tăng giá trị và tham gia sâu hơn vào chuỗi giá trị toàn cầu.</p><p><strong>Giá trị cốt lõi:</strong> Chính trực - Sáng tạo - Hợp tác - Trách nhiệm - Bền vững.</p><p>Phương châm: <em>'Thế giới làm được, ắt ta sẽ làm được.'</em></p>",
            "tam-nhin,su-menh,gia-tri-cot-loi,toan-cau", True, 365,
            "https://www.tbsgroup.vn/tam-nhin-su-menh/"),

        make_news(cat_noibo,
            "Văn hóa TBS: 30 năm xây dựng môi trường làm việc 'Như một gia đình'",
            "TBS Group tự hào về văn hóa doanh nghiệp gắn kết, nơi mỗi nhân viên là một thành viên trong đại gia đình TBS.",
            "<p>Trải qua hơn 30 năm phát triển, TBS Group đã xây dựng một <strong>văn hóa doanh nghiệp</strong> đặc trưng dựa trên tinh thần <strong>'Như một gia đình'</strong>.</p><p>Các hoạt động thường niên: Hội thao, Tất niên, Học bổng khuyến học, Teambuilding, Chương trình Living Wage... tất cả đều hướng đến mục tiêu xây dựng môi trường làm việc hạnh phúc và bền vững.</p>",
            "van-hoa,gia-dinh,tbs,30-nam", False, 400,
            "https://www.tbsgroup.vn/ve-tap-doan-tbs/gia-tri-cot-loi/"),

        make_news(cat_benvung,
            "An toàn lao động tại TBS: Tiêu chuẩn quốc tế trong từng nhà máy",
            "TBS Group áp dụng các tiêu chuẩn an toàn lao động quốc tế tại tất cả nhà máy, đảm bảo môi trường làm việc an toàn và lành mạnh.",
            "<p>An toàn lao động là ưu tiên hàng đầu tại TBS Group. Tất cả nhà máy đều áp dụng <strong>hệ thống quản lý an toàn & sức khỏe nghề nghiệp</strong> theo tiêu chuẩn quốc tế.</p><p>Các biện pháp bao gồm: đào tạo định kỳ, kiểm tra thiết bị, bảo hộ lao động đầy đủ, hệ thống PCCC hiện đại, và chương trình khám sức khỏe định kỳ cho toàn bộ CBCNV.</p>",
            "an-toan-lao-dong,tieu-chuan,quoc-te", False, 500,
            "https://www.tbsgroup.vn/phat-trien-ben-vung/suc-khoe-an-toan-lao-dong/"),

        make_news(cat_sanxuat,
            "TBS Sông Trà & TBS Đồng Xoài: Những nhà máy chiến lược tại miền Trung và Đông Nam Bộ",
            "Mở rộng năng lực sản xuất với các nhà máy vệ tinh tại Quảng Ngãi và Bình Phước, TBS Group tiếp tục củng cố vị thế dẫn đầu.",
            "<p>Trong chiến lược mở rộng năng lực sản xuất, TBS Group đã phát triển các nhà máy chiến lược:</p><ul><li><strong>TBS Sông Trà (Quảng Ngãi):</strong> Phục vụ đơn hàng lớn cho Decathlon</li><li><strong>TBS Đồng Xoài (Bình Phước):</strong> Nhà máy mới với công nghệ hiện đại</li><li><strong>TBS Miền Trung:</strong> Cầu nối quan trọng trong chuỗi cung ứng Bắc-Nam</li></ul>",
            "song-tra,dong-xoai,mien-trung,nha-may", False, 450,
            "https://www.tbsgroup.vn/linh-vuc-hoat-dong/"),
    ]

    db.add_all(articles)
    db.commit()

    print(f"[TBS NEWS] Seeded {len(categories)} categories and {len(articles)} real articles from TBS Group.")

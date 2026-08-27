import { redirect } from 'next/navigation';

// "Danh Mục" giờ là 1 nhóm xổ xuống trong sidebar (xem lib/mmtbNav.ts), không còn là 1 trang gộp
// chung — ai lỡ vào thẳng /maintenance/categories thì đưa về trang con đầu tiên.
export default function CategoriesIndexRedirect() {
  redirect('/maintenance/categories/areas');
}

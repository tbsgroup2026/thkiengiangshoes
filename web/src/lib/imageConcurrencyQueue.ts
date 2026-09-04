/**
 * Image Concurrency Queue Manager — Module điều tiết hàng đợi tải ảnh
 * 
 * Mục đích:
 * Tránh việc trình duyệt tải quá nhiều hình ảnh cùng một lúc trên các thiết bị cấu hình yếu
 * (RAM thấp <= 2GB hoặc CPU ít nhân), gây đơ giật giao diện hoặc tràn bộ nhớ.
 */

type ImageTask = () => Promise<void>;

class ImageConcurrencyQueueManager {
  private activeCount: number = 0;
  private queue: Array<{ task: ImageTask; resolve: () => void }> = [];

  /**
   * Đăng ký một công việc tải ảnh vào hàng đợi
   * @param task Hàm thực thi tải ảnh (trả về Promise)
   * @param maxConcurrency Số lượng ảnh tối đa tải đồng thời (dựa trên deviceMemory / network)
   */
  public enqueue(task: ImageTask, maxConcurrency: number = 4): Promise<void> {
    return new Promise<void>((resolve) => {
      const item = { task, resolve };
      this.queue.push(item);
      this.processNext(maxConcurrency);
    });
  }

  /**
   * Xử lý task tiếp theo trong hàng đợi nếu chưa vượt quá số lượng tối đa
   */
  private async processNext(maxConcurrency: number): Promise<void> {
    if (this.activeCount >= maxConcurrency || this.queue.length === 0) {
      return;
    }

    const nextItem = this.queue.shift();
    if (!nextItem) return;

    this.activeCount++;

    try {
      await nextItem.task();
    } catch {
      // Bỏ qua lỗi để hàng đợi không bị tắc nghẽn
    } finally {
      this.activeCount--;
      nextItem.resolve();
      // Tiếp tục giải phóng hàng đợi cho ảnh tiếp theo
      this.processNext(maxConcurrency);
    }
  }
}

// Global Singleton Instance
export const imageConcurrencyQueue = new ImageConcurrencyQueueManager();

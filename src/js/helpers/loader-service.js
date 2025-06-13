export class LoaderService {
  static isVisible = false;
  static modalElement = document.querySelector('.loader-backdrop');
  static loaderLoadMore = document.querySelector('.loader-load-more');

  static show() {
    this.isVisible = true;
    if (this.modalElement) {
      this.modalElement.classList.add('show');
    }
  }

  static showLoadMore() {
    if (this.loaderLoadMore) {
      this.loaderLoadMore.classList.add('show');
    }
  }

  static hideLoadMore() {
    if (this.loaderLoadMore) {
      this.loaderLoadMore.classList.remove('show');
    }
  }
  static hide() {
    this.isVisible = false;
    this.modalElement.classList.remove('show');
  }
}

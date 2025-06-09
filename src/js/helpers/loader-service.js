export class LoaderService {
static isVisible = false;
static modalElement = document.querySelector('.loader-backdrop')

  static show() {
  this.isVisible = true
    if (this.modalElement) {
      this.modalElement.classList.add('show');
    }
  }

  static hide() {
  this.isVisible = false;
  this.modalElement.classList.remove('show');
  }
 }
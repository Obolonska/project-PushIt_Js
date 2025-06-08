export class BlockScreenService {
  static element = document.body;

  static block() {
    this.element.classList.add('body-hidden')
  }

  static unblock() {
    this.element.classList.remove('body-hidden')
  }
}

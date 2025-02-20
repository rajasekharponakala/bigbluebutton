const Page = require('../core/page');
const e = require('./elements');
const we = require('../whiteboard/elements');
const { ELEMENT_WAIT_LONGER_TIME, ELEMENT_WAIT_TIME } = require('../core/constants');
const util = require('./util');

class Slide extends Page {
  constructor() {
    super('presentation-slide');
  }

  async test() {
    try {
      await this.waitForSelector(we.whiteboard, ELEMENT_WAIT_LONGER_TIME);
      await this.waitForSelector(e.presentationToolbarWrapper, ELEMENT_WAIT_TIME);

      const svg0 = await this.page.evaluate(util.checkSvgIndex, '/svg/1');

      await this.waitForSelector(e.nextSlide, ELEMENT_WAIT_TIME);
      await this.click(e.nextSlide, true);
      await this.waitForSelector(we.whiteboard, ELEMENT_WAIT_TIME);
      await this.page.waitForTimeout(1000);

      const svg1 = await this.page.evaluate(util.checkSvgIndex, '/svg/2');

      await this.waitForSelector(e.prevSlide, ELEMENT_WAIT_TIME);
      await this.click(e.prevSlide, true);
      await this.waitForSelector(we.whiteboard, ELEMENT_WAIT_TIME);
      await this.page.waitForTimeout(1000);

      const svg2 = await this.page.evaluate(util.checkSvgIndex, '/svg/1');

      return svg0 === true && svg1 === true && svg2 === true;
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }
}

module.exports = exports = Slide;

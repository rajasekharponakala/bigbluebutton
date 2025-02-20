const Page = require('../core/page');
const util = require('./util');
const wle = require('./elements');
const { checkElementLengthDifferentTo } = require('../core/util');
const { VIDEO_LOADING_WAIT_TIME } = require('../core/constants'); // core constants (Timeouts vars imported)
const e = require('../core/elements');

class Share extends Page {
  constructor() {
    super('webcam-share-test');
  }

  async test() {
    try {
      const parsedSettings = await this.getSettingsYaml();
      const videoPreviewTimeout = parseInt(parsedSettings.public.kurento.gUMTimeout);
      const response = await util.enableWebcam(this, videoPreviewTimeout);
      return response;
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }

  async webcamLayoutStart() {
    try {
      await this.joinMicrophone();
      const parsedSettings = await this.getSettingsYaml();
      const videoPreviewTimeout = parseInt(parsedSettings.public.kurento.gUMTimeout);
      await util.enableWebcam(this, videoPreviewTimeout);
    } catch (err) {
      await this.logger(err);
    }
  }

  async webcamLayoutTest(testName) {
    try {
      await this.waitForSelector(wle.webcamVideo, VIDEO_LOADING_WAIT_TIME);
      await this.waitForSelector(wle.stopSharingWebcam, VIDEO_LOADING_WAIT_TIME);
      await this.waitForSelector(e.isTalking);
      const foundTestElement = await this.page.evaluate(checkElementLengthDifferentTo, wle.webcamItemTalkingUser, 0);
      if (foundTestElement === true) {
        await this.screenshot(`${testName}`, `success-${testName}`);
        this.logger(testName, ' passed');
        return true;
      } else if (foundTestElement === false) {
        await this.screenshot(`${testName}`, `fail-${testName}`);
        this.logger(testName, ' failed');
        return false;
      }
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }
}

module.exports = exports = Share;

// Test: Cleaning a chat message

const Page = require('../core/page');
const e = require('./elements');
const util = require('./util');
const { checkElementLengthEqualTo } = require('../core/util');
const { ELEMENT_WAIT_TIME } = require('../core/constants');

class Clear extends Page {
  constructor() {
    super('chat-clear');
  }

  async test(testName) {
    try {
      await util.openChat(this);
      await this.screenshot(`${testName}`, `01-before-chat-message-send-[${this.meetingId}]`);

      // sending a message
      await this.type(e.chatBox, e.message);
      await this.click(e.sendButton, true);

      await this.screenshot(`${testName}`, `02-after-chat-message-send-[${this.meetingId}]`);


      const chat0 = await this.page.evaluate(checkElementLengthEqualTo, e.chatClearMessageText, 0);

      // clear
      await this.click(e.chatOptions, true);
      await this.screenshot(`${testName}`, `03-chat-options-clicked-[${this.meetingId}]`);

      await this.click(e.chatClear, true);

      await this.screenshot(`${testName}`, `04-chat-cleared-[${this.meetingId}]`);


      const chatResp = await this.waitForSelector(e.chatClearMessageText, ELEMENT_WAIT_TIME).then(() => true);

      return chat0 && chatResp;
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }
}

module.exports = exports = Clear;

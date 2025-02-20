const path = require('path');
const MultiUsers = require('../user/multiusers');
const Page = require('../core/page');
const params = require('../params');
const util = require('./util');
const utilScreenShare = require('../screenshare/util'); // utils imported from screenshare folder
const e = require('../core/elements');
const ne = require('./elements');
const pe = require('../presentation/elements');
const we = require('../whiteboard/elements');
const { ELEMENT_WAIT_TIME, UPLOAD_PDF_WAIT_TIME } = require('../core/constants');
const { checkElementTextIncludes } = require('../core/util');

class Notifications extends MultiUsers {
  constructor() {
    super('notifications');
    this.page1 = new Page();
    this.page2 = new Page();
    this.page3 = new Page();
    this.page4 = new Page();
  }

  async init(meetingId, testName) {
    await this.page1.init(Page.getArgs(), meetingId, { ...params, fullName: 'User1' }, undefined, testName);
    await this.page1.closeAudioModal();
    await this.page2.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'User2' }, undefined, testName);
    await this.page2.closeAudioModal();
  }

  async initUser3(arg, meetingId, testFolderName) {
    await this.page3.init(arg, meetingId, { ...params, fullName: 'User3' }, undefined, testFolderName);
  }

  async initUser4(testFolderName) {
    await this.page4.init(Page.getArgs(), this.page3.meetingId, { ...params, fullName: 'User' }, undefined, testFolderName);
  }

  // Save Settings toast notification
  async saveSettingsNotification(testName) {
    try {
      await this.init(undefined, testName);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-page01-initialized-${testName}`);
      await util.popupMenu(this.page1);
      await this.page1.screenshot(`${testName}`, `02-page01-popupMenu-${testName}`);
      await util.saveSettings(this.page1);
      await this.page1.screenshot(`${testName}`, `03-page01-save-settings-${testName}`);
      const resp = await util.getLastToastValue(this.page1) === ne.savedSettingsToast;
      await this.page1.screenshot(`${testName}`, `04-page01-saved-Settings-toast-${testName}`);
      return resp === true;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  // Public chat toast notification
  async publicChatNotification(testName) {
    try {
      await this.init(undefined, testName);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-page01-initialized-${testName}`);
      await util.popupMenu(this.page1);
      await this.page1.screenshot(`${testName}`, `02-page01-popup-menu-${testName}`);
      await util.enableChatPopup(this.page1);
      await this.page1.screenshot(`${testName}`, `03-page01-setting-popup-option-${testName}`);
      await util.saveSettings(this.page1);
      await this.page1.screenshot(`${testName}`, `04-page01-applied-settings-${testName}`);
      const expectedToastValue = await util.publicChatMessageToast(this.page1, this.page2);
      await this.page1.screenshot(`${testName}`, `05-page01-public-chat-message-sent-${testName}`);
      await this.page1.waitForSelector(ne.smallToastMsg, ELEMENT_WAIT_TIME);
      await this.page1.waitForSelector(ne.hasUnreadMessages, ELEMENT_WAIT_TIME);
      const lastToast = await util.getLastToastValue(this.page1);
      await this.page1.screenshot(`${testName}`, `06-page01-public-chat-toast-${testName}`);
      return expectedToastValue === lastToast;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  // Private chat toast notification
  async privateChatNotification(testName) {
    try {
      await this.init(undefined, testName);
      await this.page1.startRecording(testName);
      await this.page1.screenshot(`${testName}`, `01-page01-initialized-${testName}`);
      await util.popupMenu(this.page1);
      await this.page1.screenshot(`${testName}`, `02-page01-popup-menu-${testName}`);
      await util.enableChatPopup(this.page1);
      await this.page1.screenshot(`${testName}`, `03-page01-setting-popup-option-${testName}`);
      await util.saveSettings(this.page1);
      await this.page1.screenshot(`${testName}`, `04-page01-applied-settings-${testName}`);
      const expectedToastValue = await util.privateChatMessageToast(this.page2);
      await this.page1.screenshot(`${testName}`, `05-page01-private-chat-message-sent-${testName}`);
      await this.page1.waitForSelector(ne.smallToastMsg, ELEMENT_WAIT_TIME);
      await this.page1.waitForSelector(ne.hasUnreadMessages, ELEMENT_WAIT_TIME);
      const lastToast = await util.getLastToastValue(this.page1);
      await this.page1.screenshot(`${testName}`, `06-page01-public-chat-toast-${testName}`);
      return expectedToastValue === lastToast;
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  // User join toast notification
  async userJoinNotification(page) {
    try {
      await util.popupMenu(page);
      await util.enableUserJoinPopup(page);
      await util.saveSettings(page);
    } catch (err) {
      await this.page1.logger(err);
      return false;
    }
  }

  async getUserJoinPopupResponse(testName) {
    try {
      await this.initUser3(Page.getArgs(), undefined, testName);
      await this.page3.startRecording(testName);
      await this.page3.screenshot(`${testName}`, `01-page03-initialized-${testName}`);
      await this.page3.closeAudioModal();
      await this.page3.screenshot(`${testName}`, `02-page03-audio-modal-closed-${testName}`);
      await this.userJoinNotification(this.page3);
      await this.page3.screenshot(`${testName}`, `03-page03-after-user-join-notification-activation-${testName}`);
      await this.initUser4(testName);
      await this.page4.closeAudioModal();
      await this.page3.waitForSelector(ne.smallToastMsg, ELEMENT_WAIT_TIME);
      await this.page3.page.waitForFunction(checkElementTextIncludes, {},
        'body', 'User joined the session'
      );
      await this.page3.screenshot(`${testName}`, `04-page03-user-join-toast-${testName}`);
      return true;
    } catch (err) {
      await this.page3.logger(err);
      return false;
    }
  }

  // File upload notification
  async fileUploaderNotification(testName) {
    try {
      await this.initUser3(Page.getArgs(), undefined, testName);
      await this.page3.startRecording(testName);
      await this.page3.screenshot(`${testName}`, `01-page03-initialized-${testName}`);
      await this.page3.closeAudioModal();
      await this.page3.screenshot(`${testName}`, `02-page03-audio-modal-closed-${testName}`);
      await util.uploadFileMenu(this.page3);
      await this.page3.screenshot(`${testName}`, `03-page03-upload-file-menu-${testName}`);
      await this.page3.waitForSelector(pe.fileUpload, ELEMENT_WAIT_TIME);
      const fileUpload = await this.page3.page.$(pe.fileUpload);
      await fileUpload.uploadFile(path.join(__dirname, `../media/${e.pdfFileName}.pdf`));
      await this.page3.page.waitForFunction(checkElementTextIncludes, {},
        'body', 'To be uploaded ...'
      );
      await this.page3.waitForSelector(pe.upload, ELEMENT_WAIT_TIME);
      await this.page3.click(pe.upload, true);
      await this.page3.page.waitForFunction(checkElementTextIncludes, {},
        'body', 'Converting file'
      );
      await this.page3.screenshot(`${testName}`, `04-page03-file-uploaded-and-ready-${testName}`);
      await this.page3.waitForSelector(ne.smallToastMsg, UPLOAD_PDF_WAIT_TIME);
      await this.page3.waitForSelector(we.whiteboard, ELEMENT_WAIT_TIME);
      await this.page3.screenshot(`${testName}`, `05-page03-presentation-changed-${testName}`);
      await this.page3.page.waitForFunction(checkElementTextIncludes, {},
        'body', 'Current presentation'
      );
      await this.page3.screenshot(`${testName}`, `06-page03-presentation-change-toast-${testName}`);
      return true;
    } catch (err) {
      await this.page3.logger(err);
      return false;
    }
  }

  // Publish Poll Results notification
  async publishPollResults(testName) {
    try {
      await this.page3.screenshot(`${testName}`, `01-page03-initialized-${testName}`);
      await this.page3.closeAudioModal();
      await this.page3.screenshot(`${testName}`, `02-page03-audio-modal-closed-${testName}`);
      await this.page3.waitForSelector(we.whiteboard, ELEMENT_WAIT_TIME);
      await util.startPoll(this.page3);
      await this.page3.screenshot(`${testName}`, `03-page03-started-poll-${testName}`);
      await this.page3.waitForSelector(ne.smallToastMsg, ELEMENT_WAIT_TIME);
      const resp = await util.getLastToastValue(this.page3);
      await this.page3.screenshot(`${testName}`, `04-page03-poll-toast-${testName}`);
      return resp;
    } catch (err) {
      await this.page3.logger(err);
      return false;
    }
  }

  async audioNotification(testName) {
    try {
      await this.initUser3(Page.getArgs(), undefined, testName);
      await this.page3.startRecording(testName);
      await this.page3.screenshot(`${testName}`, `01-page03-initialized-${testName}`);
      await this.page3.joinMicrophone();
      await this.page3.screenshot(`${testName}`, `02-page03-joined-microphone-${testName}`);
      const resp = await util.getLastToastValue(this.page3) === ne.joinAudioToast;
      await this.page3.screenshot(`${testName}`, `03-page03-audio-toast-${testName}`);
      return resp;
    } catch (err) {
      await this.page3.logger(err);
      return false;
    }
  }

  async screenshareToast(testName) {
    try {
      await this.initUser3(Page.getArgs(), undefined, testName);
      await this.page3.startRecording(testName);
      await this.page3.screenshot(`${testName}`, `01-page03-initialized-${testName}`);
      await this.page3.closeAudioModal();
      await this.page3.screenshot(`${testName}`, `02-page03-audio-modal-closed-${testName}`);
      await utilScreenShare.startScreenshare(this.page3);
      await this.page3.screenshot(`${testName}`, `03-page03-screenshare-started-${testName}`);
      const response = await util.getLastToastValue(this.page3);
      await this.page3.screenshot(`${testName}`, `04-page03-screenshare-toast-${testName}`);
      return response;
    } catch (err) {
      await this.page3.logger(err);
      return false;
    }
  }

  async closePages() {
    try {
      await this.page3.close();
      await this.page4.close();
    } catch (err) {
      await this.page3.logger(err);
      return false;
    }
  }
}

module.exports = exports = Notifications;

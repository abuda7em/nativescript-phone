"use strict";
var frameModule = require("ui/frame");
var CustomMFMessageComposeViewControllerDelegate = NSObject.extend({
    initWithResolveReject: function (resolve, reject) {
        var self = this.super.init();
        if (self) {
            this.resolve = resolve;
            this.reject = reject;
        }
        return self;
    },
    messageComposeViewControllerDidFinishWithResult: function (controller, result) {
        controller.dismissModalViewControllerAnimated(true);
        if (result === MessageComposeResult.MessageComposeResultCancelled) {
            this.resolve({
                response: "cancelled"
            });
        }
        else if (result === MessageComposeResult.MessageComposeResultSent) {
            this.resolve({
                response: "success"
            });
        }
        else {
            this.resolve({
                response: "failed"
            });
        }
        CFRelease(controller.messageComposeDelegate);
    }
}, {
    name: "CustomMFMessageComposeViewControllerDelegate",
    protocols: [MFMessageComposeViewControllerDelegate]
});
function dial(telNum, prompt) {
    var sURL = "tel://";
    if (prompt) {
        sURL = "telprompt:";
    }
    var url = NSURL.URLWithString(sURL + telNum);
    var a = UIApplication.sharedApplication();
    if (a.canOpenURL(url)) {
        a.openURL(url);
        return true;
    }
    else {
        //alert("Unable to dial");
        return false;
    }
}
exports.dial = dial;
function sms(smsNum, messageText) {
    return new Promise(function (resolve, reject) {
        var numbers;
        if (!Array.isArray(smsNum))
            numbers = [smsNum];
        else
            numbers = smsNum;
        var smsNumbers = new NSArray(numbers);
        var page = frameModule.topmost().ios.controller;
        var controller = MFMessageComposeViewController.alloc().init();
        var delegate = CustomMFMessageComposeViewControllerDelegate.alloc().initWithResolveReject(resolve, reject);
        CFRetain(delegate);
        controller.messageComposeDelegate = delegate;
        if (MFMessageComposeViewController.canSendText()) {
            controller.body = messageText;
            controller.recipients = smsNumbers;
            page.presentModalViewControllerAnimated(controller, true);
        }
        else {
            reject("Cannot Send SMS!");
        }
    });
}
exports.sms = sms;
//# sourceMappingURL=index.ios.js.map
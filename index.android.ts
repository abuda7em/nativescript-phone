import * as application from "application";

export function dial(telNum:string,prompt:boolean) {
	try {
		var intentType = android.content.Intent.ACTION_CALL;
		if (prompt) {
			intentType = android.content.Intent.ACTION_DIAL
		}

		var intent = new android.content.Intent(intentType);

		intent.setData(android.net.Uri.parse("tel:" + telNum));

		application.android.foregroundActivity.startActivity(intent);
		return true;

	} catch(ex) {
		//alert("Unable to dial");
		//console.log("phone.dial failed: " + ex);
		return false;
	}
}

export function sms(smsNum:string|string[], messageText:string) {
    return new Promise(function (resolve, reject){
		let smsNumbers;
        if(!Array.isArray(smsNum)){
            smsNumbers = [smsNum];
        }else
			smsNumbers = smsNum;

    	try {
            var SEND_SMS = 1001;
    		var intent = new android.content.Intent(android.content.Intent.ACTION_VIEW);
            intent.putExtra("address", smsNumbers.join(";"));
    		intent.putExtra("sms_body", messageText);
            intent.setType("vnd.android-dir/mms-sms");

            var previousResult = application.android.onActivityResult;
            application.android.onActivityResult = function(requestCode, resultCode, data) {
                switch (requestCode) {
                     case SEND_SMS:
                        application.android.onActivityResult = previousResult;
                        if (resultCode === android.app.Activity.RESULT_OK){
                            return resolve({
                                response:"success"
                            });
                        }
                        else if (resultCode === android.app.Activity.RESULT_CANCELED){
                            return resolve({
                                response:"cancelled"
                            });
                        }
                        else {
                            return resolve({
                                response:"failed"
                            });
                        };
                    default:
                        if (typeof previousResult === 'function') {
                            previousResult(requestCode, resultCode, data);
                        }
                        break;
                }
            };
            application.android.foregroundActivity.startActivityForResult(intent, SEND_SMS);
    	} catch(ex) {
            reject(ex.toString());
    	}
    });
}

var siteurl = "http://www.triviadice.com";
function otp_send(id){
	var value=$('#mobile_n').val();
	var count = value.length;
	if(value!=""){
		$.ajax({
			type: 'POST',
			url: siteurl+'/otp_send.php',
			data: "key=1&id="+id+"&value=" + value,
			success: function(data) {
				 var result = $.trim(data);
				if(result=="success"){
					$('#ver_head').html("Please Enter the OTP");
					$('#verify').html("<span class='otp_error' style='color:red'></span><input type='text' class='form-control'  id='otp_num' name='otp_num' ><p><img src='http://www.triviadice.com/img/diceicon.png' width='14'>&nbsp;&nbsp;One Time Password (OTP) has been sent to your mobile "+value+", please enter the same here to Verify Your Phone number.</p>");
					$('#ver_button').html("<button class='edit see-more hover-both' onclick='confirm_otp();' id='confirm_otp' >Confirm</button><br><p>Wait for a minute and if you still dint receive the OTP, Please click<a style='margin:10px;cursor:pointer;color:red !important;' onclick=otp_resend('"+id+"');>Resend OTP</a> or <a style='cursor:pointer;color:red !important;' onclick=enter_phone();>Change Phone number </a></p>");
				}
				else{
					//alert("hi");
					$('.verify_error').html(result);
				}
			}
		});
	}
	else {
		alert("values cannot be empty!!!!!!!!!");
		return false;
	} 
}
function otp_resend(id){
	$('.hide_resend').hide();
	$.ajax({
			type: 'POST',
			url: siteurl+'/otp_send.php',
			data: "key=1&id=" + id+"&value=nil" ,
			success: function(data) {
				 var result = $.trim(data);
				if(result=="success"){
					$('#ver_head').html("Please Enter the OTP");
					$('#verify').html("<span class='otp_error' style='color:red'></span><input type='text' class='form-control'  id='otp_num' name='otp_num' ><p><img src='http://www.triviadice.com/img/diceicon.png' width='14'>&nbsp;&nbsp;One Time Password (OTP) has been sent to your mobile "+value+", please enter the same here to Verify Your Phone number.</p>");
					$('#ver_button').html("<button class='edit see-more hover-both' onclick='confirm_otp();' id='confirm_otp' >Confirm</button>");
				}
				else{
					$('.verify_error').html("");
				}
				
			}
		});
}
function confirm_otp(){
	var otp=$('#otp_num').val();
	 if(otp!=""){
		$.ajax({
			type: 'POST',
			url: siteurl+'/otp_send.php',
			data: "key=2&otp="+otp,
			success: function(data) {
				var datatrim = $.trim(data);
				
					var result = $.trim(data);
					window.location.href = siteurl+"?Your Phone number has been successfully verified.";
				
			}
		});
	} 
}
function enter_phone(){
	$.ajax({
		type: 'POST',
		url: siteurl+'/otp_send.php',
		data: 'key=3',
		success: function(data) {
			$('#verify_phone .color').html(data);				
		}
	});
}

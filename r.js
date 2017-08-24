$(document).ready(function () {

    var player = "";

    $("#replay_video").on('click', function(ev) {
        $(".video-ov-div").removeClass('video-share-overlay');
        $(".video-ov-div").hide();
        player.playVideo();

    });

    var mposition = '';
    var chkposition = '';

    $('[data-toggle="tooltip"]').tooltip();
    var availableVideoIndecies = [0, 1, 2, 3, 4, 5];
    var captchaContainer = null;
    var captchaEnabled = 0;
    var isMobile = phpToJsVideoFeed.isMobile;
    var captchaDivCounter = 0;
    var videosString = phpToJsVideoFeed.videosString;
    var showCaptchaBeforeNext = 0;
    var loadCaptcha = function (func, args) {

        captchaContainer = grecaptcha.render('targetForCaptcha' + captchaDivCounter, {
            'sitekey': '6LdVhBoUAAAAACKz7jIdO4bGXK03_sNRvgKolwcT',
            'callback': function (response) {
                func(args);
            }
        });
    };
// 2. This code loads the IFrame Player API code asynchronously..
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    function showStuffBeforeVideoFeedback(args) {
        $("#emojis-div-categories").show();
        $(".captchaDivs").hide();
    }

    function showNext(response) {
        $('#emojis').hide();
        $("#emojis-div-categories").hide();
        $(".captchaDivs").hide();

        clearTimeout(timeout);

        $('#footer_id').show();
        $('#footer_url').attr('href', response.next_video_url);
        var next_video_url_array = response.next_video_url.split('/');
        $('#nextvideo').attr('video-index', next_video_url_array[next_video_url_array.length - 1]);
        $('#skipvideo').attr('video-index', next_video_url_array[next_video_url_array.length - 1]);
        if (typeof response.all_available_keys != "undefined") {
            availableVideoIndecies = response.all_available_keys;
        }
        if (response.response_ep.hasOwnProperty("feedbackMsg")) {
            $('#video_response_id').show();

            var pattern = /wrong/;
            if (pattern.test(response.response_ep.feedbackMsg))
                $('#video_response_h2').css('color', 'red');

            $('#video_response_h2').html(response.response_ep.feedbackMsg);
            $('#notification-txt').html(response.response_ep.feedbackSubMsg);
            $("#video_response_ul").html('');
            response.response_ep.progressList.forEach(function (entry) {

                var cssclass = '';
                if (entry == 1)
                    cssclass = "selected";
                if (entry == 0)
                    cssclass = "";
                $("#video_response_ul").append('<li  class="' + cssclass + '"></li>');
            });

        }
    }

//closing the popup
    var video_watched_count = 0;

    $(".video-poster").hover(function () {
        $(".youtube-video-overlay").stop();
        $(".youtube-video-overlay").fadeIn(700);
    }, function () {
        $(".youtube-video-overlay").stop();
        $(".youtube-video-overlay").fadeOut(700);
    });

    $("#bodyarea").on('click', '.share_fb', function (event) {
        event.preventDefault();
        var that = $(this);
        var post = that.parents('article.post-area');
        $.ajaxSetup({cache: true});
        $.getScript('//connect.facebook.net/en_US/sdk.js', function () {
            FB.init({
                appId: '485175661693050',
                version: 'v2.3' // or v2.0, v2.1, v2.0
            });
            FB.ui({
                    method: 'share',
                    title: 'Title Goes here',
                    description: 'Description Goes here. Description Goes here. Description Goes here. Description Goes here. Description Goes here. ',
                    href: 'https://developers.facebook.com/docs/',
                },
                function (response) {
                    if (response && !response.error_code) {
                        alert('Posting completed.');
                    } else {
                        alert('Error while posting.');
                    }
                });
        });
    });

    $(".closeBtn").click(function () {
        if (typeof player.stopVideo !== "undefined")
            player.stopVideo();
        //refresh the video feed if the user watches more than one video
        if (video_watched_count > 0) {
            showloader();
            window.location = phpToJsVideoFeed.baseUrl2 + "video/ticketdetails";
        }
        $(".dialog_box_wrap").hide();
    });

    var emoji_base_url = phpToJsVideoFeed.emoji_base_url;

//function to get the perticuklar video details
    $('.' + phpToJsVideoFeed.randomNumberForListing).click(function (e) {
        e.preventDefault();
        chkposition = mposition;
        //get the video index data
        video_index = $(this).attr('video-index');
        video_session_index = video_index;
        if($(this).data("retention-clicktype") == "next-video-click") {
            var temp = {};
            temp.retentionType = $(this).data("retention-clicktype");
            temp.campId = $("#campaign_id").val();
            temp.retentionTime = 0;
            if (typeof player != "undefined" && typeof player.getCurrentTime != "undefined") {
                temp.retentionTime = player.getCurrentTime();
            }
            saveVideoRetentionInfo(temp);
        }
        load_video_by_index(video_index);
    });

    window.onYouTubeIframeAPIReady = function () {
        player = new YT.Player('video_player', {
            videoId:  phpToJsVideoFeed.videoFeed[0].videoId,
            playerVars: {
                'enablejsapi': 1,
                'playsinline': 1,
                'autoplay': 0,
                'rel': 0,
                'showinfo': 0,
                'controls': 0,
                'egm': 0,
                'showsearch': 0,
                'modestbranding': 1,
                'iv_load_policy': 3,
                'disablekb': 1,
                'loop': 0,
                'start': 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });

        setTimeout(systemduration, 1000);
    }

    function load_video_by_index(video_index)
    {

        //alert();
        //return false;

        $('#video_player').hide();
        stopVideo();

        $('#sharediv').hide();
        $('#progressdiv').hide();
        $('.video-authr').hide();
        $('.subscribebar').hide();

        $(".video-ov-div").removeClass('video-share-overlay');
        $(".video-ov-div").hide();

        $(".menu").removeClass("show")
        video_session_index = video_index;
        var options = {};

        $("#video_list").hide( );
        $("#video_list").html("");

        /*$("#video_details").hide("drop", {direction: "left"}, 100);
        $("#video_details").show("drop", {direction: "top"}, 500);*/

        $("#video_details").hide();
        $("#video_details").show();


        if (availableVideoIndecies.indexOf(parseInt(video_index)) === -1) {
            window.location = window.location;
        }

        var nxt = 0;
        var found = false;
        for (var i = 1; i <= 5; i++) {
            var tmp = parseInt(video_index) + i;
            if (availableVideoIndecies.indexOf(tmp) !== -1) {
                nxt = tmp;
                break;
            }
        }

        showloader();
        $(".youtube-video-overlay").show();
        var captchaValue = "";
        if (showCaptchaBeforeNext) {
            captchaValue = grecaptcha.getResponse(parseInt(captchaDivCounter) - 1);
        }




        setTimeout(function () {
            $(".youtube-video-overlay").stop();
            $(".youtube-video-overlay").fadeOut(1000);
        }, 200);


        $(".like-btn-text").text("Like").removeClass().addClass('like-btn-text');
        $(".like-btn-emo").removeClass().addClass('like-btn-emo').addClass("like-btn-default");
        $(".like-emo").html('<span class="like-btn-like"></span>');

        $('#sharediv').show();
        $('#progressdiv').show();
        $('.video-authr').show();
        //hide the divs
        $('#emojis').hide();
        $('#emojis-div-categories').hide();
        $('#play-load-bar').show();
        $('#video_response_id').hide();
        $('.video-width').width($("#intImage").width());
        $('.video-width').height($("#intImage").height());
        $("#intImage").hide();

        $('.subscribebar').show();
        if (isMobile) {
            $("#subscribeDiv").html('<div class="g-ytsubscribe" data-channelid="' + phpToJsVideoFeed.videoFeed[video_index].channelId + '" data-layout="default data-count="hidden" ></div>');
        } else {
            $("#subscribeDiv").html('<div class="g-ytsubscribe" data-channelid="' + phpToJsVideoFeed.videoFeed[video_index].channelId + '" data-layout="default data-count="hidden" ></div>');
        }

        gapi.ytsubscribe.go();


        $('#skipvideo').attr('video-index', nxt);
        $('#nextvideo').attr('video-index', nxt);

        //console.log(response.data);
        //console.log(player);
        video_id = phpToJsVideoFeed.videoFeed[video_index].videoId;

        closeloader();
        if (typeof player == "undefined" || typeof player.loadVideoById === "undefined") {
            $('#video_player').attr('src', 'https://www.youtube.com/embed/' + phpToJsVideoFeed.videoFeed[video_index].videoId + '?enablejsapi=1&playsinline=1&autoplay=false&controls=0&rel=0&showinfo=0&egm=0&showsearch=0&modestbranding=1&iv_load_policy=3&disablekb=1&loop=0&start=0');
            ga('send', 'event', 'JavaScript Error', "videofeed error", "page reloaded", true);
            window.location.reload();
        } else {
            player.loadVideoById(phpToJsVideoFeed.videoFeed[video_index].videoId, 0);
        }
        stopVideo();
        $('#video_player').show();

        reset_values();
        var video_range = 0;
        var video_duration = Number(phpToJsVideoFeed.videoFeed[video_index].duration);
        var video_lowerLimit = Number(phpToJsVideoFeed.videoFeed[video_index].lowerLimit);
        var video_upperLimit = Number(phpToJsVideoFeed.videoFeed[video_index].upperLimit);
        if (video_duration <= video_lowerLimit)
            video_range = video_duration - 2;
        else if (video_duration <= phpToJsVideoFeed.videoFeed[video_index].upperLimit)
            video_range = randomIntFromInterval(video_lowerLimit, (video_duration - 2));
        else
            video_range = randomIntFromInterval(video_lowerLimit, video_upperLimit);
        range = video_range;
        $('#range').html(video_range);
        $('#progress-value').html('0/' + video_range);
        setBarWidth(".style-1 span", ".style-1 em", "width", 0);

        $('#channel_image').attr('src', phpToJsVideoFeed.videoFeed[video_index].channelThumbUrl);
        $('#channel_description').html(phpToJsVideoFeed.videoFeed[video_index].description.substring(0, 25) + '....');
        $('#videoTitle').html(phpToJsVideoFeed.videoFeed[video_index].videoTitle.substring(0, 25) + '....');
        $('#videoTitle').attr('href', 'https://www.youtube.com/watch?v=' + phpToJsVideoFeed.videoFeed[video_index].videoId)
        $('#channel_upload_date').html(phpToJsVideoFeed.videoFeed[video_index].uploadTime);
        $("#video_id").val(phpToJsVideoFeed.videoFeed[video_index].videoId);
        $("#campaign_id").val(phpToJsVideoFeed.videoFeed[video_index].campId);
        if (phpToJsVideoFeed.videoFeed[video_index].total_likes>0) {
            if (phpToJsVideoFeed.videoFeed[video_index].you_liked) {

                $(".like-btn-emo").removeClass().addClass('like-btn-emo').addClass('like-btn-'+phpToJsVideoFeed.videoFeed[video_index].you_liked_status.toLowerCase());
                $(".like-btn-text").text(phpToJsVideoFeed.videoFeed[video_index].you_liked_status).removeClass().addClass('like-btn-text').addClass('like-btn-text-'+phpToJsVideoFeed.videoFeed[video_index].you_liked_status.toLowerCase()).addClass("active");
                var liketext = '';
                if (isMobile){
                    liketext = parseInt(phpToJsVideoFeed.videoFeed[video_index].total_likes) + 1 ;
                } else {
                    liketext = 'You and ' + phpToJsVideoFeed.videoFeed[video_index].total_likes + ' others';
                }

                $(".like-details").html('<a href="' + phpToJsVideoFeed.baseUrl2 + 'video/showLikedUsers/' + phpToJsVideoFeed.videoFeed[video_index].campId + '" data-remote="false" data-toggle="modal" data-target="#myModal" rel="" class="tooltipnew" >' + liketext + '</a>');
            } else {
                $(".like-details").html('<a href="' + phpToJsVideoFeed.baseUrl2 + 'video/showLikedUsers/' + phpToJsVideoFeed.videoFeed[video_index].campId + '" data-remote="false" data-toggle="modal" data-target="#myModal" rel="" class="tooltipnew" >' + phpToJsVideoFeed.videoFeed[video_index].total_likes + '</a>');
            }
        } else {
            $(".like-details").html('');
        }

        var topReaction = '';
        var topReactions = $.parseJSON(phpToJsVideoFeed.videoFeed[video_index].topReactions);
        if ( topReactions.length > 0 ) {
            $.each(topReactions, function (i, item) {
                topReaction = topReaction + '<span rel="' + item.status.toLowerCase() + '" class="tooltipnew like-btn-' + item.status.toLowerCase() + '" ></span>';
            });
        }
        $(".like-emo").html(topReaction);

        /*************************************************/

        $('.tooltipnew').tooltipster({
            animation: 'fade',
            delay: 1,
            content: 'Loading...',
            updateAnimation: false,
            functionBefore: function(instance, helper) {
                var $origin = $(helper.origin);
                if ($origin.data('ajax') !== 'cached') {
                    var like_type = $(helper.origin).attr('rel');
                    $.get( phpToJsVideoFeed.baseUrl2 + "video/liked_users/"+ phpToJsVideoFeed.videoFeed[video_index].campId +'/' + like_type, function( datares ) {
                        var users = '';
                        var dataresJson = $.parseJSON(datares);
                        $.each(dataresJson, function (i, item) {
                            if (item.user_name) {
                                users = users + '<span>' + item.user_name + '</span><br>';
                            } else {
                                users = users + '<span>' + item.buser_name + '</span><br>';
                            }
                        })
                        instance.content($(users));
                    });
                    $origin.data('ajax', 'cached');
                }
            },
            functionAfter: function(instance) {

            }
        });
        /*************************************************/

        //$(".fb-shar-btn").hide();
        if (phpToJsVideoFeed.videoFeed[video_index].shareOnFacebook) {
            $('.share-on-facebook-below-video').text("");
            if (isMobile) {
                $(".share-on-facebook-below-video").html('');
            }
            $('#share_video,.last_fb_share').attr('href', 'https://www.facebook.com/dialog/feed?app_id=485175661693050&description=Check+this+awesome+video&e2e=%7B%7D&link=https://www.youtube.com/watch?v=' + phpToJsVideoFeed.videoFeed[video_index].videoId + '&locale=en_US&name=&next=http%3A%2F%2Fstaticxx.facebook.com%2Fconnect%2Fxd_arbiter%2Fr%2FP5DLcu0KGJB.js%3Fversion%3D42%23cb%3Df1cf7ac9d58984%26domain%3Dsnuckls.com%26origin%3Dhttp%253A%252F%252Fsnuckls.com%252Ff50881fd46c3c4%26relation%3Dopener%26frame%3Df1cad30e02a5bf4%26result%3D%2522xxRESULTTOKENxx%2522&sdk=joey&version=v2.7&_rdr');
        } else {
            $('.share-on-facebook-below-video').text("");
            $('#share_video').attr('title','Learn More')
            $('#share_video').attr('href', phpToJsVideoFeed.videoFeed[video_index].shareOnFacebookUrl);

        }
        if (!isMobile) {
            $(".youtube-video-overlay .facebook,.last_fb_share").attr('href', 'https://www.facebook.com/dialog/feed?app_id=485175661693050&description=Check+this+awesome+video&e2e=%7B%7D&link=https://www.youtube.com/watch?v=' + phpToJsVideoFeed.videoFeed[video_index].videoId + '&locale=en_US&name=&next=http%3A%2F%2Fstaticxx.facebook.com%2Fconnect%2Fxd_arbiter%2Fr%2FP5DLcu0KGJB.js%3Fversion%3D42%23cb%3Df1cf7ac9d58984%26domain%3Dsnuckls.com%26origin%3Dhttp%253A%252F%252Fsnuckls.com%252Ff50881fd46c3c4%26relation%3Dopener%26frame%3Df1cad30e02a5bf4%26result%3D%2522xxRESULTTOKENxx%2522&sdk=joey&version=v2.7&_rdr"');
            $(".youtube-video-overlay .twitter,.last_twitter_share").attr('href', 'https://twitter.com/share?text=This+video+is+great.+Check+it+out:&url=https://www.youtube.com/watch?v=' + phpToJsVideoFeed.videoFeed[video_index].videoId);
            $(".youtube-video-overlay .youtube").attr('href', 'https://www.youtube.com/watch?v=' + phpToJsVideoFeed.videoFeed[video_index].videoId);
        } else {
            $(".last_twitter_share").attr('href', 'https://twitter.com/share?text=This+video+is+great.+Check+it+out:&url=https://www.youtube.com/watch?v=' + phpToJsVideoFeed.videoFeed[video_index].videoId);
        }

        $('#video_emoji_title').html(phpToJsVideoFeed.videoFeed[video_index].emojiTitle);
        loadfbcomments(phpToJsVideoFeed.baseUrl2+"FbComments/fbcommentsnew/"+phpToJsVideoFeed.videoFeed[video_index].videoId);

        var emoji_html = '';

        $.each(phpToJsVideoFeed.videoFeed[video_index].videoCategories, function (i, item) {
            //alert(item.id)
            emoji_html = emoji_html + '<li class="col-lg-3 col-md-3 col-sm-6 col-xs-6" liemojiid="' + item.randomId + '"><a href="javascript:" class="border-btn emojiclick ' + phpToJsVideoFeed.randomStringForEmoji + '" emojiid="' + item.randomId + '">' + item.cat + '</a></li>'
        });
        $("." + phpToJsVideoFeed.randomStringForEmojiDiv).html(emoji_html);
        //rendering the emoji ends here
        //initialize the progressbar properties starts

        //ending the video properties

        /*} else {
         /!*if (typeof response.needsRefresh != "undefined" && response.needsRefresh == 1) {
         window.location.reload();
         }*!/
         closeloader();
         }*/






        $(".dialog_box_wrap").show();






    }

    function stopVideo() {
        if (typeof player != "undefined" && typeof player.stopVideo != "undefined") {
            player.stopVideo();
        }
    }



//initilizing the youtube player and the youtube related functions
    var timer_error = 1;
    var currenttime = 0;
    var video_id = '';
    var timeout;
    var systemduration_timeout;
    var systemduration_timer = 0;
    var emoji_shown = 0;
    var range = 0;
    var video_session_index = 0;
    var user_watched_time = 0;
    var player = "";

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
    function onPlayerReady(event) {
        clearTimeout(timeout);
        clearTimeout(systemduration_timeout);
        currenttime = 0;
        systemduration_timer = 0;


    }

    var done = false;
    var firstStateChange = 1;
    var timeWhenVideoStarted = 0;
    var restartedValue = 0;
    function onPlayerStateChange(event) {
        console.log('playser state change');
        console.log(event);

        if (event.data !=0) {
            if (typeof player != "undefined" && typeof player.getCurrentTime != "undefined") {
                if (firstStateChange) {
                    markVideoAsStarted();
                    restartedValue = 0;
                    firstStateChange = 0;
                    timeWhenVideoStarted = Math.floor(player.getCurrentTime());
                }
                currenttime = (Math.floor(player.getCurrentTime()) + restartedValue);
            }
            timeout = setTimeout(timer, 1000);
        } else {
            if (event.data == 0) {
                restartedValue = currenttime;
                var temp = {};
                temp.retentionType = "video-finished";
                temp.campId = $("#campaign_id").val();
                temp.retentionTime = 0;
                if (typeof player != "undefined" && typeof player.getCurrentTime != "undefined") {
                    temp.retentionTime = player.getCurrentTime();
                }
                saveVideoRetentionInfo(temp);

                $(".video-ov-div").addClass('video-share-overlay');
                $(".video-ov-div").show();

                //    setTimeout(function () {
                //      event.target.playVideo();
                //}, 1000);

            } else {
                console.log('paused');
            }
            clearTimeout(timeout);
        }
    }

    function timer() {
        currenttime = currenttime + 1;
        if (currenttime < 5)
            timer_error = 0;
        else {
            if (timer_error == 1) {
//                console.log("timer error sending to ga "+video_id +"  "+ currenttime);
                if (typeof ga != "undefined") {
                    ga('send', {
                        hitType: 'event',
                        eventCategory: 'Timer',
                        eventAction: 'stopped-desktop',
                        eventLabel: video_id,
                        eventValue: currenttime
                    });
                }
                timer_error = 0;
            }
        }
        console.log((currenttime - timeWhenVideoStarted));
        //console.log(Math.floor(((currenttime/(player.getDuration()-1))*100)));
        //change the timer value
        if ((currenttime - timeWhenVideoStarted) <= range)
            $('#progress-value').html((currenttime - timeWhenVideoStarted) + '/' + range);

        //display the emojis if the range of the video matches
        if ((currenttime - timeWhenVideoStarted) == range || (currenttime - timeWhenVideoStarted) == (player.getDuration() - 1)) {
            //enable the controls
            //show the emojis
            if (emoji_shown == 0) {
                console.log('show emoji');
                $('#play-load-bar').hide();
                $('#emojis').show();
                $("#targetForCaptcha" + captchaDivCounter).show();
                emoji_shown = 1;
            }
        }
        //calculate the percentage for progrss bar
        var completeperc = Math.ceil((((currenttime - timeWhenVideoStarted) / range) * 100));
        //console.log('perc:'+completeperc);
        if (completeperc <= 100)
            setBarWidth(".style-1 span", ".style-1 em", "width", completeperc);

        timeout = setTimeout(timer, 1000);
    }

    function onPlayerError(event) {
        console.log(event);
        skip_video_a(0);
        window.location = phpToJsVideoFeed.baseUrl2 + "video/ticketdetails";
        //console.log('jadfa');
    }

//functio to record the system durtion
    function systemduration() {
        systemduration_timer = systemduration_timer + 1;
        //console.log(systemduration_timer);
        systemduration_timeout = setTimeout(systemduration, 1000);
    }


//after clickng on emojis
    $('body').on('click', 'a.' + phpToJsVideoFeed.randomStringForEmoji, function (e) {

        if(chkposition == mposition){
            /*$.ajax({
             url: phpToJsVideoFeed.baseUrl2 + "video/autoclick" + "/" + videosString,
             type: 'POST',
             dataType: 'json',
             success: function (response) {

             }
             });*/
        }

        //$('.emojiclick').click(function(e){
        e.preventDefault();
        //clearTimeout(systemduration_timeout);
        var catArr = [];

        $('#video_guess_emoji').children('li').each(function () {
            catArr.push($(this).attr('liemojiid'));
        });


        var emojiid = $(this).attr('emojiid');
        user_watched_time = currenttime;
        var total_video_duration = Math.floor(player.getDuration());
        var progress_value = range;

        if (systemduration_timer < user_watched_time)
            systemduration_timer = user_watched_time + 3;

        $('#emojis').hide();
        $('#emojiSendning').show();
        //console.log(emojiid+'/'+user_watched_time+'/'+total_video_duration+'/'+progress_value+'/'+systemduration_timer+'/'+video_session_index);
        //alert(emojiid);
        //send the data to
        var captchaValue = "";
        if (captchaEnabled) {
            captchaValue = grecaptcha.getResponse(parseInt(captchaDivCounter) - 1);
        }

        $.ajax({
            url: phpToJsVideoFeed.baseUrl2 + "video/videofeedback" + "/" + videosString,
            type: 'POST',
            dataType: 'json',
            data: {
                emojiid: emojiid,
                user_watched_time: user_watched_time,
                total_video_duration: total_video_duration,
                progress_value: progress_value,
                systemduration_timer: systemduration_timer,
                video_session_index: video_session_index,
                catArr: catArr,
                captcha_value: captchaValue,
                videosString: videosString,
            },
            success: function (response) {
                $('#emojis').hide();
                $('#emojiSendning').hide();
                video_watched_count = video_watched_count + 1;

                if (response.response == "fail") {
                    //ShowDialogBox('Video Feedback Error', 'Something went wrong', 'OK', '', '', '');
                    $('#emojis').show();
                    if (typeof response.needsCaptcha != 'undefined' && response.needsCaptcha == 1) {
                        alert("Please enter the captcha to verify.");
                        captchaDivCounter++;
                        captchaEnabled = 1;
                        $(".captchaDivs").html("<div class='class-for-captcha-divs' id='targetForCaptcha" + captchaDivCounter + "'></div>");
                        loadCaptcha(showStuffBeforeVideoFeedback, "");
                        $("#emojis-div-categories").hide();
                        $(".captchaDivs").show();
                    }
                    if (typeof response.failedInsufficientTimeValidation != 'undefined' && response.failedInsufficientTimeValidation == 1) {
                        alert("Please watch the video for the required amount of time.");
                    }
                    if (typeof response.needsRefresh != 'undefined' && response.needsRefresh == 1) {
                        window.location.reload();
                    }

                } else {
                    captchaEnabled = 0;
                    $(".captchaDivs").html("");
                    if (response.direct_redirect == 1)
                        window.location = response.next_video_url;
                    else {
                        if (response.showCaptchaBeforeNext) {
                            captchaDivCounter++;
                            captchaEnabled = 1;
                            $(".captchaDivs").html("<div class='class-for-captcha-divs' style='' id='targetForCaptcha" + captchaDivCounter + "'></div>");
                            loadCaptcha(showNext, response);
                            $('#emojis').show();
                            $("#emojis-div-categories").hide();
                            $(".captchaDivs").show();
                            showCaptchaBeforeNext = 1;
                        } else {
                            showCaptchaBeforeNext = 0;
                            showNext(response);
                        }

                        //if(response.response_ep.)
                    }
                }

            },
            error: function (response) {
                $('#emojis').show();

            }
        });

    });


    $(".more-btn").on('click', function () {
        //console.log($(".more-options"));
        $(".more-options").toggle();
    });


///functio to skip the video
    $('#skipvideo_a').click(function (e) {
        e.preventDefault();
        skip_video_a(1);
        window.location = phpToJsVideoFeed.baseUrl2 + "video/ticketdetails";
    });
    $('#reportvideo').click(function (e) {
        e.preventDefault();
        var temp = {};
        temp.retentionType = $(this).data("retention-clicktype");
        temp.campId = $("#campaign_id").val();
        temp.retentionTime = 0;
        if (typeof player != "undefined" && typeof player.getCurrentTime != "undefined") {
            temp.retentionTime = player.getCurrentTime();
        }
        saveVideoRetentionInfo(temp);
        reportvideo();
    });

//function to skip the video
    function skip_video_a() {
        $.ajax({
            url: phpToJsVideoFeed.baseUrl2 + "video/skipvideo",
            type: 'POST',
            dataType: 'json',
            data: {video_session_index: video_session_index, flag: flag},
            success: function (response) {
                console.log(response);
            },
            error: function (response) {

            }
        });
    }


    function markVideoAsStarted() {
        captchaToBeDone = 0;
        captchaToBeMade = 0;
        $.ajax({
            url: phpToJsVideoFeed.baseUrl2 + "video/mark_video_started",
            type: 'POST',
            dataType: 'json',
            data: {
                videoIndex: video_index
            },
            success: function (response) {
                if (response.needsRefresh) {
                    location.reload();
                    return;
                }


                if (response.showCaptcha == 1) {
                    captchaDivCounter++;
                    captchaEnabled = 1;
                    $(".captchaDivs").html("<div class='class-for-captcha-divs' style='' id='targetForCaptcha" + captchaDivCounter + "'></div>");
                    loadCaptcha(showStuffBeforeVideoFeedback, "");
                    $("#emojis-div-categories").hide();
                    $(".captchaDivs").show();
                } else {
                    $("#emojis-div-categories").show();
                    $(".captchaDivs").hide();
                }



            },
            error: function (response) {
                location.reload();
                return;
            }
        });
    }


//function to skip the video
    function reportvideo() {
        showloader();


        $.ajax({
            url: phpToJsVideoFeed.baseUrl2 + "video/reportvideo",
            type: 'POST',
            dataType: 'json',
            data: {video_session_index: video_session_index},
            success: function (response) {
                if (response.response == "failure") {
                    if (typeof response.needsRefresh != "undefined" && response.needsRefresh == 1) {
                        window.location.reload();
                    }
                } else {

                    availableVideoIndecies = response.all_available_keys;

                }
            },
            error: function (response) {

            }
        });

        closeloader();
        $("#skipvideo").trigger("click");
        $(".youtube-video-overlay").hide();
    }

//function to set the all initial values to zero
    function reset_values() {

        currenttime = 0;
        timeout;
        systemduration_timeout;
        systemduration_timer = 0;
        emoji_shown = 0;
        range = 0;
        //video_session_index=0;
        user_watched_time = 0;
        firstStateChange = 1;
        timeWhenVideoStarted = 0;

    }

    function setBarWidth(dataElement, barElement, cssProperty, barPercent) {
        var listData = [];
        $(dataElement).each(function () {
            listData.push($(this).html());
        });
        var listMax = Math.max.apply(Math, listData);
        //console.log(listMax);
        //console.log(listData);
        $(barElement).each(function (index) {
            $(this).css(cssProperty, (listData[index] / listMax) * barPercent + "%");
        });
    }
    setBarWidth(".style-1 span", ".style-1 em", "width", barPercent = 0);

//function to generate random number
    function randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function loadfbcomments(url) {

        $('#facebookcomments').attr('href',url);
        if (typeof FB != 'undefined') {
            // Refresh comment box.
            FB.XFBML.parse();
        }
    }

    function callPlayer(frame_id, func, args) {
        if (window.jQuery && frame_id instanceof jQuery)
            frame_id = frame_id.get(0).id;
        var iframe = document.getElementById(frame_id);
        if (iframe && iframe.tagName.toUpperCase() != 'IFRAME') {
            iframe = iframe.getElementsByTagName('iframe')[0];
        }

        // When the player is not ready yet, add the event to a queue
        // Each frame_id is associated with an own queue.
        // Each queue has three possible states:
        //  undefined = uninitialised / array = queue / 0 = ready
        if (!callPlayer.queue)
            callPlayer.queue = {};
        var queue = callPlayer.queue[frame_id],
            domReady = document.readyState == 'complete';

        if (domReady && !iframe) {
            // DOM is ready and iframe does not exist. Log a message
            window.console && console.log('callPlayer: Frame not found; id=' + frame_id);
            if (queue)
                clearInterval(queue.poller);
        } else if (func === 'listening') {
            // Sending the "listener" message to the frame, to request status updates
            if (iframe && iframe.contentWindow) {
                func = '{"event":"listening","id":' + JSON.stringify('' + frame_id) + '}';
                iframe.contentWindow.postMessage(func, '*');
            }
        } else if (!domReady ||
            iframe && (!iframe.contentWindow || queue && !queue.ready) ||
            (!queue || !queue.ready) && typeof func === 'function') {
            if (!queue)
                queue = callPlayer.queue[frame_id] = [];
            queue.push([func, args]);
            if (!('poller' in queue)) {
                // keep polling until the document and frame is ready
                queue.poller = setInterval(function () {
                    callPlayer(frame_id, 'listening');
                }, 250);
                // Add a global "message" event listener, to catch status updates:
                messageEvent(1, function runOnceReady(e) {
                    if (!iframe) {
                        iframe = document.getElementById(frame_id);
                        if (!iframe)
                            return;
                        if (iframe.tagName.toUpperCase() != 'IFRAME') {
                            iframe = iframe.getElementsByTagName('iframe')[0];
                            if (!iframe)
                                return;
                        }
                    }
                    if (e.source === iframe.contentWindow) {
                        // Assume that the player is ready if we receive a
                        // message from the iframe
                        clearInterval(queue.poller);
                        queue.ready = true;
                        messageEvent(0, runOnceReady);
                        // .. and release the queue:
                        while (tmp = queue.shift()) {
                            callPlayer(frame_id, tmp[0], tmp[1]);
                        }
                    }
                }, false);
            }
        } else if (iframe && iframe.contentWindow) {
            // When a function is supplied, just call it (like "onYouTubePlayerReady")
            if (func.call)
                return func();
            // Frame exists, send message
            iframe.contentWindow.postMessage(JSON.stringify({
                "event": "command",
                "func": func,
                "args": args || [],
                "id": frame_id
            }), "*");
        }
        /* IE8 does not support addEventListener... */
        function messageEvent(add, listener) {
            var w3 = add ? window.addEventListener : window.removeEventListener;
            w3 ?
                w3('message', listener, !1)
                :
                (add ? window.attachEvent : window.detachEvent)('onmessage', listener);
        }
    }
    //toggle the watch different video
    $(".menutogal").click(function () {
        $(".drop-btn").slideToggle();
    });
    //redirect the user after clicking the toggle bar
    $('#watch-different-video').click(function (e) {
        e.preventDefault();
        //showloader();
        window.location = phpToJsVideoFeed.baseUrl2 + "video/videofeed";
    });
    $('[data-menu]').menu();



    $(window).resize(function () {
        if($("#intImage").width()>200) {
            $('.video-width').width($("#intImage").width());
            $('.video-width').height($("#intImage").height());
        }
    });

    $("#myModal").on("show.bs.modal", function(e) {
        var link = $(e.relatedTarget);
        $(this).find(".modal-body").load(link.attr("href"));
    });

    if ("ontouchstart" in document.documentElement) {
        document.documentElement.className += " touch";
    }

    jQuery('.touch .container').each(function() {
        var div = jQuery(this);

        div.hover(function() {
            div.removeClass('no-hover');
        });

        jQuery('*').not(div).bind('click', function() {
            div.addClass('no-hover');
        });

    });


    /*****REACTION*********************************/
    var timeoutId;
    var timeIn;
    $(".like-btn").hover(function() {
            clearTimeout(timeIn);
            $(".reactions-box").show();
        },
        function () {
            clearTimeout(timeoutId);
            timeIn = window.setTimeout(function() {
                timeIn = null;
                $(".reactions-box").hide();
            }, 1000);
        });


    $(".reaction").on("click",function(){   // like click
        var data_reaction = $(this).attr("data-reaction");
        $(".reactions-box").hide();
        var emotionDuration = 0;
        if(typeof player != "undefined" && typeof player.getCurrentTime != "undefined") {
            emotionDuration = player.getCurrentTime();
        }

        $.ajax({
            type: 'POST',
            url: phpToJsVideoFeed.baseUrl2 + "video/saveLike/" ,
            data: {
                like_status: data_reaction,
                campaign_id:$("#campaign_id").val(),
                emotionDuration:emotionDuration
            },
            dataType: 'json',
            success: function (response) {


                /* $(".reactions-box").css('visibility', 'hidden');*/

                if (response.likes==0){
                    $(".like-details").html(response.user_name );
                } else {
                    var liketext = '';
                    if (isMobile){
                        liketext = parseInt(response.likes) + 1 ;
                    } else {
                        liketext = 'You and ' + response.likes + ' others';
                    }


                    if (response.you_liked) {
                        $(".like-details").html('<a href="' + phpToJsVideoFeed.baseUrl2 + 'video/showLikedUsers/' + $("#campaign_id").val() + '" data-remote="false" data-toggle="modal" data-target="#myModal" rel="" class="tooltipnew" >'+liketext+'</a>');
                    } else {
                        $(".like-details").html('<a href="' + phpToJsVideoFeed.baseUrl2 + 'video/showLikedUsers/' + $("#campaign_id").val() + '" data-remote="false" data-toggle="modal" data-target="#myModal" rel="" class="tooltipnew" >' + response.likes + '</a>');
                    }
                }


                var topReaction = '';
                var topReactions = $.parseJSON(response.topReactions);
                if ( topReactions.length > 0 ) {
                    $.each(topReactions, function (i, item) {
                        topReaction = topReaction + '<span rel="' + item.status.toLowerCase() + '" class="tooltipnew like-btn-' + item.status.toLowerCase() + '" ></span>';
                    });
                }
                $(".like-emo").html(topReaction);

                $('.tooltipnew').tooltipster({
                    animation: 'fade',
                    delay: 1,
                    content: 'Loading...',
                    updateAnimation: false,
                    functionBefore: function(instance, helper) {
                        var $origin = $(helper.origin);
                        if ($origin.data('ajax') !== 'cached') {
                            var like_type = $(helper.origin).attr('rel');
                            $.get( phpToJsVideoFeed.baseUrl2 + "video/liked_users/"+ $("#campaign_id").val() +'/' + like_type, function( datares ) {
                                var users = '';
                                var dataresJson = $.parseJSON(datares);
                                $.each(dataresJson, function (i, item) {
                                    if (item.user_name) {
                                        users = users + '<span>' + item.user_name + '</span><br>';
                                    } else {
                                        users = users + '<span>' + item.buser_name + '</span><br>';
                                    }
                                })
                                instance.content($(users));
                            });
                            $origin.data('ajax', 'cached');
                        }
                    },
                    functionAfter: function(instance) {

                    }
                });
            }
        });



        $(".like-btn-emo").removeClass().addClass('like-btn-emo').addClass('like-btn-'+data_reaction.toLowerCase());
        $(".like-btn-text").text(data_reaction).removeClass().addClass('like-btn-text').addClass('like-btn-text-'+data_reaction.toLowerCase()).addClass("active");


    });

    /************************************************************UNLIKE*****************************************************************************************************/

    $(".like-btn-text").on("click",function() { // undo like click
        if ($(this).hasClass("active")) {
            $.ajax({
                type: 'POST',
                url: phpToJsVideoFeed.baseUrl2 + "video/removeLike/",
                data: {campaign_id: $("#campaign_id").val()},
                dataType: 'json',
                success: function (response) {


                    if (response.likes > 0) {
                        $(".like-details").html('<a href="' + phpToJsVideoFeed.baseUrl2 + 'video/showLikedUsers/' + $("#campaign_id").val() + '" data-remote="false" data-toggle="modal" data-target="#myModal" rel="" class="tooltipnew" >' + response.likes + '</a>');
                    } else {
                        $(".like-details").html('');
                    }


                    var topReaction = '';
                    var topReactions = $.parseJSON(response.topReactions);
                    if (topReactions.length > 0) {
                        $.each(topReactions, function (i, item) {
                            topReaction = topReaction + '<span rel="' + item.status.toLowerCase() + '" class="tooltipnew like-btn-' + item.status.toLowerCase() + '" ></span>';
                        });
                    }
                    $(".like-emo").html(topReaction);

                    $('.tooltipnew').tooltipster({
                        animation: 'fade',
                        delay: 1,
                        content: 'Loading...',
                        updateAnimation: false,
                        functionBefore: function (instance, helper) {
                            var $origin = $(helper.origin);
                            if ($origin.data('ajax') !== 'cached') {
                                var like_type = $(helper.origin).attr('rel');
                                $.get(phpToJsVideoFeed.baseUrl2 + "video/liked_users/" + $("#campaign_id").val() + '/' + like_type, function (datares) {
                                    var users = '';
                                    var dataresJson = $.parseJSON(datares);
                                    $.each(dataresJson, function (i, item) {
                                        if (item.user_name) {
                                            users = users + '<span>' + item.user_name + '</span><br>';
                                        } else {
                                            users = users + '<span>' + item.buser_name + '</span><br>';
                                        }
                                    })
                                    instance.content($(users));
                                });
                                $origin.data('ajax', 'cached');
                            }
                        },
                        functionAfter: function (instance) {

                        }
                    });
                }
            });
            $(".like-btn-text").text("Like").removeClass().addClass('like-btn-text');
            $(".like-btn-emo").removeClass().addClass('like-btn-emo').addClass("like-btn-default");
            $(".like-emo").html('<span class="like-btn-like"></span>');

        }
    });




    $(".youtube-video-overlay a, #videoTitle, #share_video, .last_fb_share, .last_twitter_share").on("click", function(event){

        if ($(this).attr('id') == 'videoTitle'){
            var clicked_type = "youtube_title"
        } else if ($(this).attr('id') == 'share_video'){
            var clicked_type = "fb_button"
        } else if ($(this).hasClass('last_fb_share') ){
            var clicked_type = "last_fb_button"
        } else if ($(this).hasClass('last_twitter_share')){
            var clicked_type = "last_twitter_button"
        } else {
            var clicked_type = $(this).attr("class").split(' ').pop();
        }
        var campaign_id = $("#campaign_id").val();
        var video_id = $("#video_id").val();

        var trackData = {
            'campaign_id': campaign_id,
            'clicked_type': clicked_type
        }

        var hasMatch =false;
        for (var index = 0; index < trackedIds.length; ++index) {
            var cid = trackedIds[index].campaign_id;
            var typ = trackedIds[index].clicked_type;
            if(cid == campaign_id && typ==clicked_type){
                hasMatch = true;
                break;
            }
        }

        if (!hasMatch) {
            trackedIds.push(trackData);
            $.post(phpToJsVideoFeed.baseUrl2 + "video/trackClick", {
                clicked_type: clicked_type,
                campaign_id: campaign_id,
                video_id: video_id
            })
                .done(function (data) {
                });
        }
    });


    /****************/


    $( document ).on( "mousemove", function( event ) {
        mposition = event.pageX
    });

    function saveVideoRetentionInfo(data) {
        if(typeof data.retentionTime == "undefined") {
            return false;
        }
        if(parseInt(data.retentionTime) == 0) {
            return false;
        }
        $.ajax({
            url: phpToJsVideoFeed.baseUrl2 + "video/trackRetentionData",
            type: 'POST',
            dataType: 'json',
            data: {
                "campId" : data.campId,
                "retentionType" : data.retentionType,
                "retentionTime" : data.retentionTime,

            },
            success: function (response) {

            },
            error: function (response) {
                return;
            }
        });
    }

    $('.tooltiplink').tooltipster();


});

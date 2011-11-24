/*
 * 'Missing e' Extension
 *
 * Copyright 2011, Jeremy Cutler
 * Released under the GPL version 3 licence.
 * SEE: GPL-LICENSE.txt
 *
 * This file is part of 'Missing e'.
 *
 * 'Missing e' is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * 'Missing e' is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with 'Missing e'. If not, see <http://www.gnu.org/licenses/>.
 */

/*global $,chrome,getLocale */

(function($){

MissingE.timestamps = {

   receiveTimestamp: function(response) {
      var info;
      if (response.success) {
         info = $('#post_' + response.pid)
                        .find('span.MissingE_timestamp');
         info.html(response.data);
      }
      else {
         var extraHTML = '';
         if (response.debugMode) {
            extraHTML = ' (<a href="' + addr + '/api/read/json?id=' +
                        response.pid + '">' + response.pid + '</a>)';
         }
         var failHTML = 'Timestamp loading failed.';
         if (isTumblrURL(location.href, ["messages"])) {
            failHTML += ' <a class="MissingE_timestamp_retry" href="#" ' +
                        'onclick="return false;">Retry</a>';
         }
         info = $('#post_' + response.pid)
                        .find('span.MissingE_timestamp');
         info.html(failHTML + extraHTML);
      }
   },
   
   loadTimestamp: function(item) {
      var lang = $('html').attr('lang');
   
      if (item.tagName === "LI" && $(item).hasClass("post") &&
          $(item).attr("id") !== "new_post" &&
          $(item).find('.private_label').length === 0) {
         var tid = $(item).attr("id").match(/\d*$/)[0];
         var perm = $(item).find("a.permalink:first");
         var addr, type, stamp;
         if (isTumblrURL(location.href, ["messages"])) {
            type = 'ask';
            addr = 'http://www.tumblr.com/edit/';
            stamp = '';
         }
         else if (perm.length > 0) {
            type = 'other';
            addr = '';
            stamp = perm.attr('title').replace(/^.* \- /,'');
         }
         if (!tid || (!addr && addr !== '') || (!stamp && stamp !== '')) {
            return;
         }
         var div = $(item).find("div.post_info");
         if (div.length === 0) {
            $(item).find(".post_controls:first")
                  .after('<div class="post_info">' +
                         '<span class="MissingE_timestamp" ' +
                         'style="font-weight:normal;">' +
                         getLocale(lang).loading +
                         '</span></div>');
         }
         else {
            var spn = div.find('span.MissingE_timestamp');
            if (spn.length === 0) {
               div.append('<br><span class="MissingE_timestamp" ' +
                          'style="font-weight:normal;">' +
                          getLocale(lang).loading + '</span>');
            }
            else {
               spn.text(getLocale(lang).loading);
            }
         }
         extension.sendRequest("timestamp",
                               {pid: tid, url: addr, lang: lang, stamp: stamp,
                                type: type},
                               this.receiveTimestamp);
      }
   },

   run: function() {
      $('head').append('<style type="text/css">' +
                       'span.MissingE_timestamp a {' +
                       'text-decoration:none !important } ' +
                       'span.MissingE_timestamp a:hover { ' +
                       'text-decoration:underline !important; }' +
                       '</style>');
      $('#posts li.post div.post_info a.MissingE_timestamp_retry')
         .live('click',function() {
         var post = $(this).closest('li.post');
         if (post.length === 1) {
            MissingE.timestamps.loadTimestamp($(this).parents('li.post').get(0));
         }
      });
      $('#posts li.post').each(function(){
         MissingE.timestamps.loadTimestamp(this);
      });
      extension.addAjaxListener(function(type,list) {
         console.log(type);
         if (type === 'notes') { return; }
         $.each(list, function(i,val) {
            MissingE.timestamps.loadTimestamp($('#'+val).get(0));
         });
      });
   },

   init: function() {
      this.run();
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.timestamps.init();
}

})(jQuery);
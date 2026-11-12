@php
use App\Models\UserData;
$GLOBALS['activenotify'] = true;
$compromised = false;
function notification($dismiss = '', $ntid, $heading, $body) {
    $closeMSG = __('messages.Close');
    $dismissMSG = __('messages.Dismiss');
    $dismissBtn = '';
    if ($dismiss) {
        if ($dismiss === 'hide-star-notification') {
            $dismissBtn = '<form method="POST" action="' . route('dismissNotification') . '"><input type="hidden" name="_token" value="' . csrf_token() . '"><button type="submit" class="btn btn-danger">'.$dismissMSG.'</button></form>';
        }
    }
    echo <<<MODAL
    <div class="modal fade" id="$ntid" data-bs-backdrop="true" data-bs-keyboard="false" tabindex="-1" aria-labelledby="${ntid}-label" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="${ntid}-label">$heading</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="bd-example">
                        $body
                    </div>
                </div>
                <div class="modal-footer">
                    $dismissBtn
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">$closeMSG</button>
                </div>
            </div>
        </div>
    </div>
MODAL;
}

function notificationCard($ntid, $icon, $heading, $subheading) {
  echo "<a data-bs-target=\"#{$ntid}\" data-bs-toggle=\"modal\" style=\"cursor:pointer!important;\" class=\"iq-sub-card\">
          <div class=\"d-flex align-items-center\">
            <i class=\"{$icon} p-1 avatar-40 rounded-pill bg-soft-primary d-flex justify-content-center align-items-center\"></i>
            <div class=\"ms-3 w-100\">
              <h6 class=\"mb-0 \">{$heading}</h6>
              <div class=\"d-flex justify-content-between align-items-center\">
                <p class=\"mb-0\">{$subheading}</p>
              </div>
            </div>
          </div>
        </a>";
}

//security check, checks if config files got compromised
if(auth()->user()->role == 'admin'){

function getUrlSatusCodesb($urlsb, $timeoutsb = 3)
 {
 $request = function ($headRequest) use ($urlsb, $timeoutsb) {
   $chsb = curl_init();
   $optssb = array(
     CURLOPT_RETURNTRANSFER => true,
     CURLOPT_URL => $urlsb,
     CURLOPT_NOBODY => $headRequest,
     CURLOPT_FOLLOWLOCATION => true,
     CURLOPT_MAXREDIRS => 3,
     CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
     CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
     CURLOPT_CONNECTTIMEOUT => 1,
     CURLOPT_TIMEOUT => $timeoutsb,
   );
   if (!$headRequest) {
     // A one-byte range keeps the fallback GET from downloading a database.
     $optssb[CURLOPT_HTTPGET] = true;
     $optssb[CURLOPT_RANGE] = '0-0';
   }
   curl_setopt_array($chsb, $optssb);
   $result = curl_exec($chsb);
   $status = curl_getinfo($chsb, CURLINFO_HTTP_CODE);
   $effectiveUrl = curl_getinfo($chsb, CURLINFO_EFFECTIVE_URL);
   $failed = $result === false || $status === 0;
   curl_close($chsb);

   // A cross-host redirect is ambiguous; fail closed instead of trusting it.
   if ($failed || strcasecmp((string) parse_url($urlsb, PHP_URL_HOST), (string) parse_url($effectiveUrl, PHP_URL_HOST)) !== 0) {
     return null;
   }
   return $status;
 };

 $status = $request(true);
 if ($status === null || ($status >= 200 && $status < 300)) {
   return $status;
 }
 // Confirm every non-exposing HEAD result with a bounded one-byte GET. Some
 // servers return 401/403/404/405 for HEAD while serving the same path via GET.
 return $request(false);
 }

// PHP's local development server is single-threaded. Calling itself here would
// block every admin request until both probes time out. The local router denies
// these files; other servers keep the check, cached to avoid two probes per page.
if (PHP_SAPI === 'cli-server') {
    // Fail closed for a bare `php -S` launch. Only the protected router may
    // skip the self-probes that deadlock a single-threaded development server.
    $compromised = !(defined('LINKSTACK_PROTECTED_LOCAL_ROUTER') && LINKSTACK_PROTECTED_LOCAL_ROUTER === true);
} else {
    $compromised = \Illuminate\Support\Facades\Cache::remember('security-files-publicly-accessible', 3600, function () {
        $url1sb = getUrlSatusCodesb(url('.env'), 2);
        $url2sb = getUrlSatusCodesb(url('database/database.sqlite'), 2);
        // Network/probe failures are unsafe-to-assume-safe, so warn instead of
        // silently caching a false negative.
        return $url1sb === null || $url2sb === null
            || ($url1sb >= 200 && $url1sb < 300)
            || ($url2sb >= 200 && $url2sb < 300);
    });
}
}
 // end security check

$notifyID = Auth::user()->id;
@endphp


{{-- Notification Cards --}}
    @php
        $notifications = [
            [
                'id' => 'modal-1',
                'icon' => 'bi bi-exclamation-triangle-fill text-danger',
                'title' => __('messages.Your security is at risk!'),
                'message' => __('messages.Immediate action is required!'),
                'condition' => $compromised,
                'dismiss' => '',
                'adminonly' => true,
            ],
            [
                'id' => 'modal-star',
                'icon' => 'bi bi-heart-fill',
                'title' => __('messages.Enjoying Linkstack?'),
                'message' => __('messages.Help Us Out'),
                'condition' => UserData::getData($notifyID, 'hide-star-notification') !== true,
                'dismiss' => __('messages.Hide this notification'),
                'adminonly' => true,
            ],
        ];

        $shownNotifications = array_filter($notifications, function($notification) {
            return $notification['condition'] && (!$notification['adminonly'] || (auth()->user()->role == 'admin'));
        });
    @endphp

    @if(count($shownNotifications) > 0)
        @foreach($shownNotifications as $notification)
        @push('notifications')
            {{ notificationCard($notification['id'], $notification['icon'], $notification['title'], $notification['message'], $notification['dismiss']) }}
        @endpush
        @endforeach
    @else
        @php $GLOBALS['activenotify'] = false; @endphp
        @push('notifications')
        <center class='p-2'><i>{{__('messages.No notifications')}}</i></center>
        @endpush
    @endif



{{-- Notification Modals --}}
@push('sidebar-scripts') @php
notification('', 'modal-1', __('messages.Your security is at risk!'), '<b>'.__('messages.security.msg1').'</b> '.__('messages.security.msg2').'<br><br>'.__('messages.security.msg3').'<br><a href="'.url('admin/config#5').'">'.__('messages.security.msg3').'</a>.');
notification('hide-star-notification', 'modal-star', __('messages.Support Linkstack'), ''.__('messages.support.msg1').' <a target="_blank" href="https://github.com/linkstackorg/linkstack">'.__('messages.support.msg2').'</a>. '.__('messages.support.msg3').'<br><br>'.__('messages.support.msg4').' <a target="_blank" href="https://linkstack.org/donate">'.__('messages.support.msg5').'<br><br>'.__('messages.support.msg6').'');
@endphp @endpush

{{-- Notification state changes are handled by the CSRF-protected POST route. --}}
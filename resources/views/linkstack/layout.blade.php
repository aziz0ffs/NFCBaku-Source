<!DOCTYPE html>
@include('layouts.lang')
<head>
   @stack('linkstack-head')
   @stack('linkstack-head-end')
   @if(isset($userinfo) && $userinfo->littlelink_name === 'turab')
      <link rel="stylesheet" href="{{ asset('assets/linkstack/css/nfc-turab.css') }}?v=2">
   @elseif(isset($userinfo) && in_array($userinfo->id, [960487, 960488], true) && in_array($userinfo->littlelink_name, ['turab-noir', 'turab-rose'], true))
      <link rel="stylesheet" href="{{ asset('assets/linkstack/css/turab-campaign.css') }}?v=1">
   @endif
</head>
<body @if(isset($userinfo) && $userinfo->littlelink_name === 'turab')class="nfc-turab-page"@elseif(isset($userinfo) && in_array($userinfo->id, [960487, 960488], true) && in_array($userinfo->littlelink_name, ['turab-noir', 'turab-rose'], true))class="turab-campaign-page {{ $userinfo->littlelink_name === 'turab-rose' ? 'turab-rose' : 'turab-noir' }}"@endif>
   @stack('linkstack-body-start')
   <div class="container">
      <div class="row">
         <div class="column" style="margin-top: 5%">
            @stack('linkstack-content')
         </div>
      </div>
   </div>
   @stack('linkstack-body-end')
</body>
</html>
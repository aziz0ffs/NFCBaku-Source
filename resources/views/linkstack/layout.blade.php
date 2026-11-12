<!DOCTYPE html>
@include('layouts.lang')
<head>
   @stack('linkstack-head')
   @stack('linkstack-head-end')
   @if(isset($userinfo) && $userinfo->littlelink_name === 'turab')
      <link rel="stylesheet" href="{{ asset('assets/linkstack/css/nfc-turab.css') }}">
   @endif
</head>
<body @if(isset($userinfo) && $userinfo->littlelink_name === 'turab')class="nfc-turab-page"@endif>
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
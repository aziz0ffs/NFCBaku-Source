@php
    $identityOptions = \App\Models\UserData::getData($userinfo->id, 'identity');
    $identityOptions = is_array($identityOptions) ? $identityOptions : [];
    $avatar = findAvatar($userinfo->id);
    $portrait = $avatar !== 'error.error' && is_file(base_path($avatar)) ? url($avatar) : asset('assets/img/user.png');
    $social = [];
    foreach ($links as $link) {
        $href = trim($link->link ?? '');
        // Links retain their IDs and the normal LinkStack click counter endpoint.
        if (!preg_match('~^https://[^\s]+$~i', $href) || !filter_var($href, FILTER_VALIDATE_URL)) continue;
        $label = strip_tags($link->title ?: $link->name);
        $social[] = ['id' => $link->id, 'label' => $label, 'description' => '', 'url' => $href,
            'icon' => strtolower($label) === 'instagram' ? 'instagram' : (strtolower($label) === 'whatsapp' ? 'message' : 'web')];
    }
    $identityProfile = [
        'name' => $userinfo->name,
        'monogram' => mb_strtoupper(mb_substr($userinfo->name, 0, 1)),
        'location' => (string) ($identityOptions['location'] ?? ''),
        'profession' => (string) ($identityOptions['profession'] ?? ''),
        'portrait' => ['src' => $portrait, 'alt' => $userinfo->name, 'position' => '57% 38%'],
        'biography' => strip_tags($userinfo->littlelink_description ?? ''),
        'quote' => (string) ($identityOptions['quote'] ?? ''),
        'phone' => (string) ($identityOptions['phone'] ?? ''),
        'email' => (string) ($identityOptions['email'] ?? ''),
        'canonicalUrl' => url('/@'.$userinfo->littlelink_name),
        'clickEndpoint' => route('clickNumber'),
        'social' => $social,
        'appearance' => ['background' => '#0B0D12', 'accent' => '#C4A77D', 'card' => '#191c21',
            'displayFont' => '"Barlow Condensed", sans-serif', 'motion' => 'full'],
    ];
    $manifest = json_decode(file_get_contents(base_path('themes/identity/build/.vite/manifest.json')), true);
    $entry = $manifest['index.html'];
@endphp
<!DOCTYPE html>
<html lang="az">
<head>
    @include('linkstack.modules.meta')
    @foreach($entry['css'] ?? [] as $css)
    <link rel="stylesheet" href="{{ asset('themes/identity/build/'.$css) }}">
    @endforeach
</head>
<body>
    <script type="application/json" id="identity-profile">{!! json_encode($identityProfile, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) !!}</script>
    <div id="root"></div>
    <noscript>
        <main><h1>{{ $userinfo->name }}</h1><p>{{ strip_tags($userinfo->littlelink_description ?? '') }}</p>
        <img src="{{ $portrait }}" alt="{{ $userinfo->name }}" width="240">
        @foreach($social as $item)<p><a href="{{ $item['url'] }}" rel="noopener noreferrer">{{ $item['label'] }}</a></p>@endforeach
        </main>
    </noscript>
    <footer style="padding:24px;text-align:center;background:#0B0D12;color:#c4a77d">
        <a href="https://github.com/aziz0ffs/NFCBaku-Source" style="color:inherit" rel="noopener noreferrer">Mənbə kodu (AGPL-3.0)</a> · <a href="https://linkstack.org" style="color:inherit" rel="noopener noreferrer">LinkStack</a>
    </footer>
    <script type="module" src="{{ asset('themes/identity/build/'.$entry['file']) }}"></script>
</body>
</html>

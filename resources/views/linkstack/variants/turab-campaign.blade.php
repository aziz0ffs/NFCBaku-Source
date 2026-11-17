@php
    $rose = $userinfo->littlelink_name === 'turab-rose';
    $avatar = findAvatar($userinfo->id);
    $siteAvatar = findFile('avatar');
    $portrait = $avatar !== 'error.error' && file_exists(base_path($avatar))
        ? url($avatar)
        : ($siteAvatar !== 'error.error' ? asset('assets/linkstack/images/'.$siteAvatar) : asset('assets/img/user.png'));
    $social = $links->filter(fn ($link) => in_array(strtolower($link->title), ['whatsapp', 'instagram', 'telegram'], true)
        && preg_match('~^https://~i', $link->link));
@endphp
<main class="tc-scene" aria-label="Turab — tanışlıq profili">
    <div class="tc-orbit tc-orbit-one" aria-hidden="true"></div>
    <div class="tc-orbit tc-orbit-two" aria-hidden="true"></div>
    <div class="tc-grain" aria-hidden="true"></div>
    <div class="tc-frame">
        <div class="tc-topline">
            <span class="tc-brand"><span class="tc-brand-mark" aria-hidden="true">✦</span> NFC BAKU <span class="tc-brand-divider">/</span> TURAB</span>
            <span class="tc-edition">{{ $rose ? '02 — GÜN BATIMI' : '01 — GECƏ' }}</span>
        </div>
        <div class="tc-layout">
            <div class="tc-visual">
                <div class="tc-halo" aria-hidden="true"></div>
                <div class="tc-photo-wrap">
                    <img class="tc-photo" src="{{ $portrait }}" alt="Turabın portreti" fetchpriority="high">
                </div>
                <div class="tc-photo-caption"><span>BAKI</span><span>✦</span><span>2026</span></div>
            </div>
            <div class="tc-content">
                <div class="tc-kicker"><span class="tc-pulse" aria-hidden="true"></span> BİR SALAM, BİR HEKAYƏ</div>
                <h1 class="tc-title">Turab<span class="tc-period">.</span></h1>
                <p class="tc-lead">{{ $rose ? 'Bəlkə bu hekayə bir salamla başlayır.' : 'Tanışlıq təsadüf ola bilər. Davamı seçimdir.' }}</p>
                <div class="tc-rule" aria-hidden="true"><span></span></div>
                <p class="tc-description">{{ $rose ? 'Yaxşı söhbət üçün böyük bəhanəyə ehtiyac yoxdur. Sadəcə “salam” demək kifayətdir.' : 'Ekranın o biri tərəfində sadəcə bir profil yox, tanış olmağa dəyər biri var. Söhbəti sən başlat.' }}</p>
                <div class="tc-actions">
                    @foreach($social as $link)
                        @php $label = strtolower($link->title); @endphp
                        <a id="{{ $link->id }}" class="tc-action button-click {{ $label === 'whatsapp' ? 'tc-action-primary' : 'tc-action-secondary' }}" href="{{ $link->link }}" target="_blank" rel="noopener noreferrer nofollow" aria-label="Turab ilə {{ ucfirst($label) }} vasitəsilə əlaqə">
                            <span class="tc-action-icon" aria-hidden="true">{{ $label === 'whatsapp' ? '↗' : ($label === 'instagram' ? '◎' : '✈') }}</span>
                            <span>{{ $label === 'whatsapp' ? 'Söhbətə başla' : ucfirst($label) }}</span>
                            <span class="tc-action-arrow" aria-hidden="true">↗</span>
                        </a>
                    @endforeach
                </div>
                <div class="tc-footnote"><span class="tc-footnote-star" aria-hidden="true">✳</span> Ən yaxşı hekayələr bir mesajla başlayır.</div>
            </div>
        </div>
        <div class="tc-bottomline"><span>ÖZ HEKAYƏNİ YAZ</span><span class="tc-bottomline-center">✦</span><span>BAKI • AZƏRBAYCAN</span></div>
    </div>
</main>
<script>
    document.querySelectorAll('.tc-action.button-click').forEach(function (link) {
        link.addEventListener('click', function () {
            var key = 'clicked-' + link.id;
            if (!sessionStorage.getItem(key)) {
                sessionStorage.setItem(key, 'true');
                fetch(@json(route('clickNumber')) + '/' + encodeURIComponent(link.id), {method: 'GET'}).catch(function () {});
            }
        });
    });
</script>

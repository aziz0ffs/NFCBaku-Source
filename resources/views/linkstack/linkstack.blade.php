@extends('linkstack.layout')

@section('content')
    @push('linkstack-head')
        @include('linkstack.modules.meta')
        @include('linkstack.modules.assets')
    @endpush

    @push('linkstack-head-end')
        @foreach($information as $info)
            @include('linkstack.modules.theme')
        @endforeach
    @endpush

    @push('linkstack-body-start')
        @include('linkstack.modules.admin-bar')
        @include('linkstack.modules.share-button')
        @include('linkstack.modules.report-icon')
    @endpush

    @push('linkstack-content')
        @foreach($information as $info)
            @if($userinfo->littlelink_name === 'turab')
                <section class="nfc-hero" aria-label="Turab profili">
                    <div class="nfc-hero-top"><span class="nfc-status-dot" aria-hidden="true"></span>NFC BAKU <span class="nfc-hero-separator">/</span> RƏQƏMSAL PROFİL</div>
            @endif
            @include('linkstack.elements.avatar')
            @include('linkstack.elements.heading')
            @include('linkstack.elements.bio')
            @if($userinfo->littlelink_name === 'turab')
                    <p class="nfc-hero-caption">Bir toxunuşla paylaş.</p>
                    <div class="nfc-hero-line" aria-hidden="true"></div>
                </section>
            @endif
        @endforeach
        @include('linkstack.elements.icons')
        @include('linkstack.elements.buttons')
        @yield('content')
        @include('linkstack.modules.footer')
    @endpush
@endsection
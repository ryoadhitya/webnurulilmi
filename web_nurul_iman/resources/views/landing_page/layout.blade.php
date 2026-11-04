<!DOCTYPE html>
<html lang="id">

<head>
    <base href="{{ asset('landingPage') }}/">
    <title>@yield('title', 'YPI Nurul Ilmi Bekasi')</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Work+Sans:100,200,300,400,500,600,700,800,900" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Fredericka+the+Great" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('landingPage/css/bootstrap.min.css') }}">
    <link rel="stylesheet" href="{{ asset('landingPage/css/open-iconic-bootstrap.min.css') }}">
    <link rel="stylesheet" href="{{ asset('landingPage/css/animate.css') }}">
    <link rel="stylesheet" href="{{ asset('landingPage/css/owl.carousel.min.css') }}">
    <link rel="stylesheet" href="{{ asset('landingPage/css/owl.theme.default.min.css') }}">
    <link rel="stylesheet" href="{{ asset('landingPage/css/magnific-popup.css') }}">
    <link rel="stylesheet" href="{{ asset('landingPage/css/aos.css') }}">
    <link rel="stylesheet" href="{{ asset('landingPage/css/ionicons.min.css') }}">
    <link rel="stylesheet" href="{{ asset('landingPage/css/flaticon.css') }}">
    <link rel="stylesheet" href="{{ asset('landingPage/css/icomoon.css') }}">
    <link rel="stylesheet" href="{{ asset('landingPage/css/style.css') }}">
    @yield('head')
</head>

<body>
    @include('landing_page.navbar')

    <div id="page-content">
        @yield('content')
    </div>

    @include('landing_page.footer')

    <div id="ftco-loader" class="show fullscreen"><svg class="circular" width="48px" height="48px">
            <circle class="path-bg" cx="24" cy="24" r="22" fill="none" stroke-width="4" stroke="#eeeeee" />
            <circle class="path" cx="24" cy="24" r="22" fill="none" stroke-width="4" stroke-miterlimit="10" stroke="#F96D00" />
        </svg></div>

    <script src="{{ asset('landingPage/js/jquery.min.js') }}"></script>
    <script src="{{ asset('landingPage/js/jquery-migrate-3.0.1.min.js') }}"></script>
    <script src="{{ asset('landingPage/js/popper.min.js') }}"></script>
    <script src="{{ asset('landingPage/js/bootstrap.min.js') }}"></script>
    <script src="{{ asset('landingPage/js/jquery.easing.1.3.js') }}"></script>
    <script src="{{ asset('landingPage/js/jquery.waypoints.min.js') }}"></script>
    <script src="{{ asset('landingPage/js/jquery.stellar.min.js') }}"></script>
    <script src="{{ asset('landingPage/js/owl.carousel.min.js') }}"></script>
    <script src="{{ asset('landingPage/js/jquery.magnific-popup.min.js') }}"></script>
    <script src="{{ asset('landingPage/js/aos.js') }}"></script>
    <script src="{{ asset('landingPage/js/jquery.animateNumber.min.js') }}"></script>
    <script src="{{ asset('landingPage/js/scrollax.min.js') }}"></script>
    <script src="{{ asset('landingPage/js/main.js') }}"></script>
    @yield('scripts')
</body>

</html>
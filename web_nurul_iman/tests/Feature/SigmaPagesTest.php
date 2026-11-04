<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SigmaPagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_sigma_pages_can_be_opened_from_the_navigation(): void
    {
        $response = $this->get(route('about'));

        $response->assertOk()
            ->assertSee(route('tk-sigma'))
            ->assertSee(route('daycare-sigma'));
    }

    public function test_facilities_gallery_uses_the_shared_layout_and_route(): void
    {
        $response = $this->get(route('facilities.gallery'));

        $response->assertOk()
            ->assertSee('Galeri Fasilitas')
            ->assertSee(route('home'))
            ->assertSee('landingPage/css/galeri-fasilitas.css');

        $this->assertSame(1, substr_count($response->getContent(), 'id="ftco-navbar"'));
        $this->assertSame(1, substr_count($response->getContent(), 'class="ftco-footer ftco-bg-dark ftco-section"'));
        $this->assertSame(1, substr_count($response->getContent(), 'id="ftco-loader"'));
    }

    public function test_homepage_facilities_button_uses_the_gallery_route(): void
    {
        $response = $this->get(route('home'));

        $response
            ->assertOk()
            ->assertSee(route('facilities.gallery'))
            ->assertSee('landingPage/css/galeri-fasilitas.css')
            ->assertSee('landingPage/js/fasilitas-gallery.js')
            ->assertSee('sarana-olahraga')
            ->assertDontSee('sarana-ol-shop');

        $this->assertSame(17, substr_count($response->getContent(), 'class="ni-fas-card"'));
    }

    public function test_tk_sigma_page_is_available(): void
    {
        $response = $this->get(route('tk-sigma'));

        $response
            ->assertOk()
            ->assertSee('TK Sigma')
            ->assertSee('Unit Sigma')
            ->assertSee(route('daycare-sigma'))
            ->assertSee('landingPage/images/smartschool.png');

        $this->assertSame(1, substr_count($response->getContent(), 'id="ftco-navbar"'));
        $this->assertSame(1, substr_count($response->getContent(), 'class="ftco-footer ftco-bg-dark ftco-section"'));
        $this->assertSame(1, substr_count($response->getContent(), 'id="ftco-loader"'));
    }

    public function test_daycare_sigma_page_is_available(): void
    {
        $response = $this->get(route('daycare-sigma'));

        $response
            ->assertOk()
            ->assertSee('Daycare Sigma')
            ->assertSee('Unit Sigma')
            ->assertSee(route('tk-sigma'))
            ->assertSee('landingPage/images/smartschool.png');

        $this->assertSame(1, substr_count($response->getContent(), 'id="ftco-navbar"'));
        $this->assertSame(1, substr_count($response->getContent(), 'class="ftco-footer ftco-bg-dark ftco-section"'));
        $this->assertSame(1, substr_count($response->getContent(), 'id="ftco-loader"'));
    }
}

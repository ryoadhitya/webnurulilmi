<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login_for_admin_pages(): void
    {
        $this->get(route('admin.articles.index'))->assertRedirect(route('admin.login'));
        $this->get(route('admin.categories.index'))->assertRedirect(route('admin.login'));
        $this->get(route('admin.tags.index'))->assertRedirect(route('admin.login'));
    }

    public function test_login_page_is_available_without_authentication(): void
    {
        $this->get(route('admin.login'))
            ->assertOk()
            ->assertSee('Masuk ke dashboard')
            ->assertSee('name="email"', false)
            ->assertSee('name="password"', false);
    }

    public function test_invalid_credentials_do_not_authenticate_user(): void
    {
        $user = User::factory()->create(['password' => 'correct-password']);

        $this->withoutMiddleware(ValidateCsrfToken::class)
            ->post(route('admin.login.store'), [
                'email' => $user->email,
                'password' => 'incorrect-password',
            ])->assertRedirect()
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_valid_credentials_authenticate_user_and_redirect_to_dashboard(): void
    {
        $user = User::factory()->create(['password' => 'correct-password']);

        $this->withoutMiddleware(ValidateCsrfToken::class)
            ->post(route('admin.login.store'), [
                'email' => strtoupper($user->email),
                'password' => 'correct-password',
            ])
            ->assertRedirect(route('admin.articles.index'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_logout_ends_the_authenticated_session(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->withoutMiddleware(ValidateCsrfToken::class)
            ->post(route('admin.logout'))
            ->assertRedirect(route('admin.login'));

        $this->assertGuest();
    }
}

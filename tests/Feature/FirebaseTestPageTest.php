<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class FirebaseTestPageTest extends TestCase
{
    public function test_authenticated_user_can_view_firebase_test_page_and_get_status(): void
    {
        $user = User::factory()->make(['id' => 1]);

        $this->actingAs($user)
            ->get('/firebase-test')
            ->assertOk();

        $this->actingAs($user)
            ->getJson('/firebase-test/status')
            ->assertOk()
            ->assertJsonStructure([
                'enabled',
                'project_id',
                'topic',
                'has_credentials',
                'has_token',
                'total_sent',
                'total_failed',
                'recent_messages',
            ]);
    }

    public function test_authenticated_user_can_send_test_fcm_message(): void
    {
        $user = User::factory()->make(['id' => 1]);

        $opensslConfig = tempnam(sys_get_temp_dir(), 'openssl_');
        $this->assertNotFalse($opensslConfig);
        file_put_contents($opensslConfig, "[req]\ndistinguished_name=dn\n[dn]\n");

        try {
            $options = [
                'private_key_bits' => 2048,
                'private_key_type' => OPENSSL_KEYTYPE_RSA,
                'config' => $opensslConfig,
            ];
            $resource = openssl_pkey_new($options);
            $this->assertNotFalse($resource);
            $privateKey = '';
            $this->assertTrue(openssl_pkey_export($resource, $privateKey, null, $options));
        } finally {
            @unlink($opensslConfig);
        }

        config()->set('error-redirect.firebase.enabled', true);
        config()->set('error-redirect.firebase.project_id', 'ui-test-project');
        config()->set('error-redirect.firebase.credentials', json_encode([
            'client_email' => 'firebase-adminsdk@ui-test-project.iam.gserviceaccount.com',
            'private_key' => $privateKey,
            'project_id' => 'ui-test-project',
            'token_uri' => 'https://oauth2.googleapis.com/token',
        ], JSON_THROW_ON_ERROR));

        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response([
                'access_token' => 'ui-access-token',
                'expires_in' => 3600,
            ], 200),
            'https://fcm.googleapis.com/v1/projects/ui-test-project/messages:send' => Http::response([
                'name' => 'projects/ui-test-project/messages/999',
            ], 200),
        ]);

        $this->actingAs($user)
            ->postJson('/firebase-test/send', [
                'topic' => 'error-logs',
                'title' => 'UI Test',
                'message' => 'Hello from Inertia UI',
            ])
            ->assertOk()
            ->assertJson([
                'sent' => true,
                'status' => 200,
                'target' => ['topic' => 'error-logs'],
            ]);

        $this->actingAs($user)
            ->getJson('/firebase-test/status')
            ->assertOk()
            ->assertJsonPath('recent_messages.0.title', 'UI Test')
            ->assertJsonPath('recent_messages.0.sent', true);
    }
}

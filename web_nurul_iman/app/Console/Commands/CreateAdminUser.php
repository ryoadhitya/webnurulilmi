<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CreateAdminUser extends Command
{
    protected $signature = 'admin:create-user';

    protected $description = 'Buat akun untuk masuk ke dashboard admin';

    public function handle(): int
    {
        $this->info('Database akun admin: '.DB::connection()->getDatabaseName());

        $nameInput = $this->ask('Nama admin');
        $emailInput = $this->ask('Email admin');

        if (! is_string($nameInput) || ! is_string($emailInput)) {
            $this->error('Nama dan email admin wajib diisi.');

            return self::FAILURE;
        }

        $name = trim($nameInput);
        $email = strtolower(trim($emailInput));

        $validator = Validator::make(
            ['name' => $name, 'email' => $email],
            ['name' => ['required', 'string', 'max:255'], 'email' => ['required', 'email', 'max:255', 'unique:users,email']]
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $password = $this->secret('Password admin (minimal 12 karakter)');
        $confirmation = $this->secret('Konfirmasi password');

        if (! is_string($password) || ! is_string($confirmation) || strlen($password) < 12 || $password !== $confirmation) {
            $this->error('Password harus minimal 12 karakter dan kedua input harus sama.');

            return self::FAILURE;
        }

        User::create([
            'name' => $name,
            'email' => $email,
            'password' => $password,
        ]);

        $this->info("Akun admin {$email} berhasil dibuat.");

        return self::SUCCESS;
    }
}

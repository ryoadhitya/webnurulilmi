<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('articles')) {
            return;
        }

        Schema::create('articles', function (Blueprint $table) {
            $table->id();
           $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('title_id');
            $table->text('content_id');
            $table->string('title_en')->nullable();
            $table->text('content_en')->nullable();
            $table->string('image')->nullable();
            $table->string('author_name')->default('Admin');
            $table->unsignedBigInteger('views')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};

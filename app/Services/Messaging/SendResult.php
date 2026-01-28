<?php

namespace App\Services\Messaging;

class SendResult
{
    public function __construct(
        public bool $success,
        public ?string $messageId = null,
        public ?string $error = null,
        public array $metadata = []
    ) {}

    public static function success(?string $messageId = null, array $metadata = []): self
    {
        return new self(
            success: true,
            messageId: $messageId,
            metadata: $metadata
        );
    }

    public static function failure(string $error, array $metadata = []): self
    {
        return new self(
            success: false,
            error: $error,
            metadata: $metadata
        );
    }
}

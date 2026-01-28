<?php

test('homepage returns successful response', function () {
    $this->get('/')->assertStatus(200);
});

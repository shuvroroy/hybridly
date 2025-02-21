<?php

use Hybridly\Hybridly;
use Hybridly\View\Factory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;

test('external responses to non-hybridly requests', function () {
    mockRequest(hybridly: false, bind: true);

    expect(hybridly()->external('https://google.fr/'))
        ->toBeInstanceOf(RedirectResponse::class)
        ->getStatusCode()->toBe(Response::HTTP_FOUND)
        ->headers->all()->toMatchArray([
            'location' => ['https://google.fr/'],
        ]);
});

test('external responses to hybridly requests', function () {
    mockRequest(hybridly: true, bind: true);

    expect(hybridly()->external('https://google.fr/'))
        ->toBeInstanceOf(Response::class)
        ->getStatusCode()->toBe(Response::HTTP_CONFLICT)
        ->headers->all()->toMatchArray([
            Hybridly::EXTERNAL_HEADER => ['https://google.fr/'],
        ]);
});

test('external responses with redirect responses as input', function () {
    mockRequest(hybridly: true, bind: true);

    $redirect = new RedirectResponse('https://google.fr/');

    expect(hybridly()->external($redirect))
        ->toBeInstanceOf(Response::class)
        ->getStatusCode()->toBe(Response::HTTP_CONFLICT)
        ->headers->all()->toMatchArray([
            Hybridly::EXTERNAL_HEADER => ['https://google.fr/'],
        ]);
});

test('hybridly responses to non-hybridly requests', function () {
    hybridly()->setRootView(Hybridly::DEFAULT_ROOT_VIEW);
    hybridly()->setVersion('123');

    $request = mockRequest(url: '/users/makise', hybridly: false, bind: true);
    $factory = hybridly('users.edit', ['user' => 'Makise Kurisu']);
    $response = $factory->toResponse($request);
    $payload = $response->getOriginalContent()->getData()['payload'];

    expect($factory)->toBeInstanceOf(Factory::class);
    expect($response)->toBeInstanceOf(Response::class);
    expect($payload)->toMatchArray([
        'dialog' => null,
        'version' => '123',
        'url' => 'http://localhost/users/makise',
        'view' => [
            'component' => 'users.edit',
            'properties' => [
                'user' => 'Makise Kurisu',
            ],
        ],
    ]);
});

test('hybridly responses to hybridly requests', function () {
    hybridly()->setRootView(Hybridly::DEFAULT_ROOT_VIEW);
    hybridly()->setVersion('123');

    $request = mockRequest(url: '/users/makise', hybridly: true, bind: true);
    $factory = hybridly('users.edit', ['user' => 'Makise Kurisu']);
    $response = $factory->toResponse($request);
    $payload = $response->getOriginalContent();

    expect($factory)->toBeInstanceOf(Factory::class);
    expect($response)->toBeInstanceOf(JsonResponse::class);
    expect($payload)->toMatchArray([
        'dialog' => null,
        'version' => '123',
        'url' => 'http://localhost/users/makise',
        'view' => [
            'component' => 'users.edit',
            'properties' => [
                'user' => 'Makise Kurisu',
            ],
        ],
    ]);
});

test('properties can be added on-the-fly on the factory instance', function () {
    hybridly()->setRootView(Hybridly::DEFAULT_ROOT_VIEW);
    hybridly()->setVersion('123');

    $request = mockRequest(url: '/users/makise', hybridly: true, bind: true);
    $factory = hybridly('users.edit', ['user' => 'Makise Kurisu'])
        ->with('husband', 'Okabe Rintarou');

    $response = $factory->toResponse($request);
    $payload = $response->getOriginalContent();

    expect($factory)->toBeInstanceOf(Factory::class);
    expect($response)->toBeInstanceOf(JsonResponse::class);
    expect($payload)->toMatchArray([
        'dialog' => null,
        'version' => '123',
        'url' => 'http://localhost/users/makise',
        'view' => [
            'component' => 'users.edit',
            'properties' => [
                'user' => 'Makise Kurisu',
                'husband' => 'Okabe Rintarou',
            ],
        ],
    ]);
});

test('dialogs and their properties can be resolved', function () {
    Route::get('/', fn () => hybridly('index', ['foo' => 'bar']))->name('index');

    $request = mockRequest(url: '/users/makise', hybridly: true, bind: true);
    $factory = hybridly('users.edit', [
        'user' => 'Makise Kurisu',
        'email' => fn () => 'makise@gadgetlab.jp',
    ])->base('index');

    $response = $factory->toResponse($request);
    $payload = $response->getOriginalContent();

    expect($factory)->toBeInstanceOf(Factory::class);
    expect($response)->toBeInstanceOf(JsonResponse::class);
    expect($payload)->toMatchArray([
        'view' => [
            'component' => 'index',
            'properties' => [
                'foo' => 'bar',
            ],
        ],
        'dialog' => [
            'component' => 'users.edit',
            'properties' => [
                'user' => 'Makise Kurisu',
                'email' => 'makise@gadgetlab.jp',
            ],
            'baseUrl' => 'http://localhost',
            'redirectUrl' => 'http://localhost',
            'key' => data_get($payload, 'dialog.key'),
        ],
        'url' => 'http://localhost/users/makise',
        'version' => null,
    ]);
});

test('the url resolver is used when constructing a response', function () {
    hybridly()->setUrlResolver(fn (Request $request) => 'https://customdomain.com' . $request->getRequestUri());

    $request = mockRequest(url: '/users/makise', hybridly: true, bind: true);
    $payload = hybridly('foo.bar')
        ->toResponse($request)
        ->getOriginalContent();

    expect($payload)->toMatchArray([
        'url' => 'https://customdomain.com/users/makise',
    ]);
});

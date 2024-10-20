% Import de Bibliotecas HTTP
:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_client)).
:- use_module(library(http/http_server)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_parameters)).
:- use_module(library(http/http_open)).
:- use_module(library(http/http_cors)).
:- use_module(library(date)).
:- use_module(library(random)).

:- use_module(library(http/json_convert)).
:- use_module(library(http/http_json)).
:- use_module(library(http/json)).



iniciar_servidor(PORT) :-
    http_server(http_dispatch, [port(PORT)]).

:- http_handler('/start', start_engine_handler, []).

start_engine_handler(Request) :-
        http_read_json_dict(Request,Dict,[]),
        reply_json('teste').
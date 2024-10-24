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
:- use_module(library(socket)).

:- use_module(library(http/json_convert)).
:- use_module(library(http/http_json)).
:- use_module(library(http/json)).


:-op(220,xfx,entao).
:-op(35,xfy,se).
:-op(240,fx,regra).
:-op(500,fy,nao).
:-op(600,xfy,e).


:-dynamic justifica/1, facto/2, ultimo_facto/1, facto_perguntavel/1.

%:-include('inicio.txt').

% 
%   SERVER START
%
iniciar_servidor(PORT) :-
    http_server(http_dispatch, [port(PORT)]).

:- http_handler('/start', start_engine_handler, []).

:- http_handler('/how', justifica_handler, []).

%
%    API
%

%   MAIN CONTROLLER

start_engine_handler(Request) :-
    http_read_json_dict(Request, Dict, []),
    apaga_factos,
    EvidenciaStringList = Dict.evidencia,
    ValorStringList = Dict.valor,
    get_list_atom(EvidenciaStringList, EvidenciaAtomList),
    get_list_atom(ValorStringList, ValorAtomList),
    criar_todos_os_sintomas(EvidenciaAtomList, ValorAtomList),
    processa_regras.

% HOW CONTROLLER

justifica_handler(_) :-
    findall(sintoma(ID, Evidencia, Opcao), historico(sintoma(ID, Evidencia, Opcao)), ListaSintomas),
    reply_json(ListaSintomas).

:-op(220,xfx,entao).
:-op(35,xfy,se).
:-op(240,fx,regra).
:-op(500,fy,nao).
:-op(600,xfy,e).

:-dynamic ultimo_facto/1, sintoma/3, diagnostico/3.

get_list_atom([], []).
get_list_atom([String|StringList], [Atom|AtomList]) :-
    atom_string(Atom, String),
    get_list_atom(StringList, AtomList).

criar_todos_os_sintomas([], [], []).
criar_todos_os_sintomas([Evidencia|EvidenciaList], [Valor|ValorList]) :-
    A1 =.. [Evidencia, Valor],
    cria_sintoma(A1),
    criar_todos_os_sintomas(EvidenciaList, ValorList).
    

% Create Sintoma as a fact with 3 elements: evidence, options, chosen option
cria_sintoma(Evidencia, Opcao) :-
    retract(ultimo_facto(N1)),
    N is N1 + 1,
    asserta(ultimo_facto(N)),
    assertz(sintoma(N, Evidencia, Opcao)),
    assertz(justifica(sintoma(N, Evidencia, Opcao))).

% Process all rules based on the current symptoms
processa_regras :-
    findall((ID, LHS, RHS), (regra ID se LHS entao RHS), Regras),
    aplica_regras(Regras).

% Apply rules to generate diagnostics, dynamically asking for missing Sintomas
aplica_regras([(ID, LHS, RHS) | Regras]) :-
    condicao_compativel(LHS),   % Check if conditions match current Sintomas
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    % Save the path of the rules that were applied for each diagnostic
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    concluir_diagnostico(ID, RHS),
    aplica_regras(Regras).

aplica_regras([]).

% Check if the conditions match with the existing Sintomas
condicao_compativel([A e B]) :-
    verifica_sintoma(A),
    condicao_compativel([B]).

condicao_compativel([A]) :-
    verifica_sintoma(A).

% Check if a Sintoma is available, if not, ask the user for it
verifica_sintoma(Sintoma) :-
    Sintoma =.. [Nome, _, _],
    sintoma(_, Nome, _), !.   % If Sintoma is found, succeed

verifica_sintoma(Sintoma) :-
    Sintoma =.. [Nome, Opcoes, _],
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    % Ask the user for the missing Sintoma
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    cria_sintoma(Nome, Opcoes, Opcao).

% Conclude and assert diagnostics based on rule conditions
concluir_diagnostico(ID, []).

concluir_diagnostico(ID, [diagnostico(Diagnostico)]) :-
    assertz(diagnostico(ID, Diagnostico)).

% Clear all previous facts
apaga_factos :-
    retractall(sintoma(_, _, _)),
    retractall(diagnostico(_, _)),
    retractall(ultimo_facto(_)),
    retractall(justifica(_)),
    asserta(ultimo_facto(0)).

% Example Rule Structure
% Define rules with conditions (LHS) and conclusions (RHS)
regra 1 se [sintoma1(_, _, yes) e sintoma2(_, _, no)] entao [diagnostico('Diagnostico1')].
regra 2 se [sintoma3(_, _, yes)] entao [diagnostico('Diagnostico2')].

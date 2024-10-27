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
    findall(sintoma(ID, Evidencia, Opcao), justifica(sintoma(ID, Evidencia, Opcao)), ListaSintomas),
    reply_json(ListaSintomas).

get_list_atom([], []).
get_list_atom([String|StringList], [Atom|AtomList]) :-
    atom_string(Atom, String),
    get_list_atom(StringList, AtomList).

criar_todos_os_sintomas([], []).
criar_todos_os_sintomas([Evidencia|EvidenciaList], [Valor|ValorList]) :-
    A1 =.. [Evidencia, Valor],
    cria_sintoma(A1),
    criar_todos_os_sintomas(EvidenciaList, ValorList).
    

% Create Sintoma as a fact with 3 elements: evidence, options, chosen option
cria_sintoma(Evidencia, Opcao) :-
    retract(ultimo_facto(N1)),
    N is N1 + 1,
    asserta(ultimo_facto(N)),
    assertz(sintoma(N, Evidencia, _, Opcao)),
    atualiza_justifica(sintoma(N, Evidencia, Opcao)).

atualiza_justifica(NovoSintoma) :-
    retract(justifica(ListaAntiga)),
    append([NovoSintoma], ListaAntiga, NovaLista),
    assertz(justifica(NovaLista)).

% Process all rules based on the current symptoms
processa_regras :-
    findall((ID, LHS, RHS), (regra ID se LHS entao RHS), Regras),
    aplica_regras(Regras, []).

% Apply rules to generate diagnostics, dynamically asking for missing Sintomas
aplica_regras([(ID, LHS, RHS) | Regras], SintomasConfirmados) :-
    condicao_compativel(LHS, SintomasConfirmados, NovosSintomas),
    concluir_diagnostico(ID, RHS, NovosSintomas),
    aplica_regras(Regras, NovosSintomas).

aplica_regras([], _).

condicao_compativel([A e B], SintomasConfirmados, NovosSintomas) :-
    verifica_sintoma(A),
    condicao_compativel([B], [A | SintomasConfirmados], NovosSintomas).

condicao_compativel([A], SintomasConfirmados, [A | SintomasConfirmados]) :-
    verifica_sintoma(A).

% Verifica se o sintoma existe e é compatível
verifica_sintoma(Sintoma) :-
    Sintoma =.. [_, Evidencia, _, Valor],
    sintoma_existente(Evidencia, Valor).

% Retorna falso se houver um valor diferente para a mesma evidência
verifica_sintoma(Sintoma) :-
    Sintoma =.. [_, Evidencia, _, Valor],
    sintoma_existente(Evidencia, ValorDiferente),
    Valor \= ValorDiferente,
    !.

% Caso a evidência ainda não tenha sido perguntada, pede ao utilizador
verifica_sintoma(Sintoma) :-
    Sintoma =.. [_, Evidencia, Opcoes, _],
    %%%perguntar aqui%%%   % Perguntar, caso ainda não tenha sido perguntado
    cria_sintoma(Evidencia, NovoValor),
    verifica_sintoma(Sintoma).

% Conclude and assert diagnostics based on rule conditions, with symptoms that led to it
concluir_diagnostico(ID, [], SintomasConfirmados).

concluir_diagnostico(ID, [diagnostico(Diagnostico)], SintomasConfirmados) :-
    assertz(diagnostico(ID, Diagnostico, SintomasConfirmados)),
    retract(SintomasConfirmados).


% Clear all previous facts
apaga_factos :-
    retractall(sintoma(_, _, _)),
    retractall(diagnostico(_, _)),
    retractall(ultimo_facto(_)),
    retractall(justifica(_)),
    asserta(ultimo_facto(0)).

% Example Rule Structure
% Define rules with conditions (LHS) and conclusions (RHS)
    sintoma(Evidencia, Opcoes, Valor)
    sintoma(Evidencia, Opcoes, Valor)
regra 1 se [sintoma1(_, _, yes) e sintoma2(_, _, no)] entao [diagnostico('Diagnostico1')].
regra 2 se [sintoma3(_, _, yes)] entao [diagnostico('Diagnostico2')].

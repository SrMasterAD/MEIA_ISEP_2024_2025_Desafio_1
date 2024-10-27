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
    aplica_regras(Regras).

% Apply rules to generate diagnostics, dynamically asking for missing Sintomas
aplica_regras([(ID, LHS, RHS) | Regras]) :-
    condicao_compativel(LHS),
    concluir_diagnostico(ID, RHS),
    aplica_regras(Regras).

aplica_regras([]).

% Check if the conditions match with the existing Sintomas
condicao_compativel([A e B | C]) :-
    verifica_sintoma(A),
    condicao_compativel([B e C]).

condicao_compativel([A e B]) :-
    verifica_sintoma(A),
    condicao_compativel([B]).

condicao_compativel([A]) :-
    verifica_sintoma(A).

verifica_sintoma(Sintoma) :-
    Sintoma =.. [ID, Evidencia, _, Valor],
    sintoma_existente(Evidencia, Valor).  % Retorna verdadeiro se houver um sintoma com a mesma evidência e valor

verifica_sintoma(Sintoma) :-
    Sintoma =.. [ID, Evidencia, _, Valor],
    sintoma_existente(Evidencia, ValorDiferente), 
    Valor \= ValorDiferente, !.                    % Retorna falso se houver um valor diferente para a mesma evidencia 

verifica_sintoma(Sintoma) :-
    Sintoma =.. [_, Evidencia, Opcoes, _],
    %%%perguntar aqui%%%                           % Perguntar, caso ainda nao tenha sido perguntado
    cria_sintoma(NovaEvidencia, NovoValor),
    verifica_sintoma(Sintoma).

% Predicado para verificar existência de um sintoma com a mesma Evidencia e Valor
sintoma_existente(Evidencia, Valor) :-
    sintoma(_, Evidencia, Valor).

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
    sintoma(Evidencia, Opcoes, Valor)
    sintoma(Evidencia, Opcoes, Valor)
regra 1 se [sintoma1(_, _, yes) e sintoma2(_, _, no)] entao [diagnostico('Diagnostico1')].
regra 2 se [sintoma3(_, _, yes)] entao [diagnostico('Diagnostico2')].

% COMUNICAÇÃO COM API
% Predicate to send JSON data to an external API
send_json_to_external_api(URL) :-
    % Convert `sintoma` facts to a JSON-compatible list
    findall(_{id:ID, evidencia:Evidencia, opcoes:Opcoes, valor:Valor}, sintoma(ID, Evidencia, Opcoes, Valor), Sintomas),
    
    % Send JSON data to the specified URL
    http_post(URL, json(Sintomas), Response, []),
    
    % Print the response from the external API
    writeln("Response from external API:"),
    writeln(Response).

:- http_handler('/send_data', send_data_handler, []).

send_data_handler(_Request) :-
    % Define the external URL where data will be sent
    ExternalAPIURL = 'http://localhost:8001/receive_sintoma',
    
    % Send JSON data to the external API
    send_json_to_external_api(ExternalAPIURL),
    
    % Respond to the client that data has been sent
    reply_json(_{status: "data_sent"}).

% COMO TESTAR
% ?- iniciar_servidor(8000).
% curl -X GET http://localhost:8000/send_data
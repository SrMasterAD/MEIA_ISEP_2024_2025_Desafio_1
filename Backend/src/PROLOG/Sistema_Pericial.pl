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


:-dynamic facto/2, ultimo_facto/1, facto_perguntavel/1.

:-include('Inicio.txt').

%server start

iniciar_servidor(PORT) :-
    http_server(http_dispatch, [port(PORT)]).

:- http_handler('/start', start_engine_handler, []).

ultimo_facto(1).

start_engine_handler(Request) :-
    http_read_json_dict(Request, Dict, []),
    EvidenciaString = Dict.evidencia,
    ValorString = Dict.valor,
    atom_string(EvidenciaAtom, EvidenciaString),
    atom_string(ValorAtom, ValorString),
    A1 =.. [EvidenciaAtom, ValorAtom, _],
	cria_facto(A1),
	ultimo_facto(N),
	facto(N, Facto),
	facto_dispara_regras1(Facto, LRegras),
         dispara_regras(N, Facto, LRegras),
         ultimo_facto(N),!.

facto_dispara_regras1(Facto, LRegras):-
	facto_dispara_regras(Facto, LRegras),
	!.
facto_dispara_regras1(_, []).
% Caso em que o facto n�o origina o disparo de qualquer regra.

dispara_regras(N, Facto, [ID|LRegras]):-
	regra ID se LHS entao RHS,
	facto_esta_numa_condicao(Facto,LHS),
	verifica_condicoes(LHS, LFactos),
	member(N,LFactos),
	concluir(RHS,LFactos),
	!,
	dispara_regras(N, Facto, LRegras).

%avan�a para a proxima regra sen�o encontra o primeiro facto
dispara_regras(N, Facto, [_|LRegras]):-
	dispara_regras(N, Facto, LRegras).

dispara_regras(_, _, []).


facto_esta_numa_condicao(F,[F  e _]).

facto_esta_numa_condicao(F,[avalia(F1)  e _]):- F=..[H,H1|_],F1=..[H,H1|_].

facto_esta_numa_condicao(F,[_ e Fs]):- facto_esta_numa_condicao(F,[Fs]).

facto_esta_numa_condicao(F,[F]).

facto_esta_numa_condicao(F,[avalia(F1)]):-F=..[H,H1|_],F1=..[H,H1|_].


% Verifica se os factos ja estao criados senao pergunta ao utilizador a% op��o para pode criar o facto de seguida
verifica_condicoes([A e B],[N|ListaFactos]):- !,
	A=..[NomeFacto,_,_],
	(   (facto(N,A), verifica_condicoes([B],ListaFactos));
	(\+ facto(N,A), facto_perguntavel(A), Facto=..[NomeFacto,_,_],
	  Facto_perguntavel_apagar=..[facto_perguntavel,Facto],
	  retractall(Facto_perguntavel_apagar),!, pergunta(A),facto(N,A),verifica_condicoes([B],ListaFactos))).

verifica_condicoes([A],[N]):- !,
	A=..[NomeFacto,_,_],
	(   (facto(N,A));
	(\+ facto(N,A), facto_perguntavel(A), Facto=..[NomeFacto,_,_],
	  Facto_perguntavel_apagar=..[facto_perguntavel,Facto],
	  retractall(Facto_perguntavel_apagar),!, pergunta(A),facto(N,A))).

% Conclus�o do necess�rio a fazer
concluir([cria_facto(A)|Y],LFactos):-
	!,
	A=..[_,Numero,_],
	write('e necessario: '), tipo(Numero,Conclusao), write(Conclusao),
	concluir(Y,LFactos).

concluir([],_):-!.


%Faz a cria��o dos factos
cria_facto(F):-
	facto(_,F),!.

cria_facto(F):-
	retract(ultimo_facto(N1)),
	N is N1+1,
	asserta(ultimo_facto(N)),
	assertz(facto(N,F)),
	write('Foi concluido o facto n '),write(N),write(' -> '),write(F),
	get0(_),nl,nl,!.

apaga_factos:-
	retractall(facto(,)),
	retractall(ultimo_facto(_)),
	retractall(facto_perguntavel(_)).

%Pergunta ao utilizador,
pergunta(A):- A=..[NomeFacto,Resposta_Esperada_Utilizador,_],
	facto_pergunta(NomeFacto, Pergunta, Respostas),
	reply_json(json(_{pergunta: Pergunta, resposta: RespostaEsperadaUtilizador})),
	A1 =..[NomeFacto,Resposta_Utilizador,_], cria_facto(A1), Resposta_Esperada_Utilizador == Resposta_Utilizador.

escreve_opcoes([], _).
escreve_opcoes([Resposta1|Respostas], C):- write(C), write(' -> '), write(Resposta1),nl, C1 is C+1,  escreve_opcoes(Respostas, C1).

buscar_opcao(_,C,C,_).
buscar_opcao([Resposta1|Respostas], C, C1, Resposta_Utilizador):- C2 is C1+1,((C == C2, Resposta_Utilizador=Resposta1), buscar_opcao(Respostas,C,C2,Resposta_Utilizador);
									     buscar_opcao(Respostas,C,C2,Resposta_Utilizador) ).

% Motrar todos os factos
mostra_factos:-
	findall(N, facto(N, _), LFactos),
	escreve_factos(LFactos).

escreve_factos([I|R]):-facto(I,F), !,
	write('O facto n '),write(I),write(' -> '),write(F),write(' verdadeiro'),nl,
	escreve_factos(R).
escreve_factos([I|R]):-
	write('A condicao '),write(I),write(' e verdadeira'),nl,
	escreve_factos(R).
escreve_factos([]).

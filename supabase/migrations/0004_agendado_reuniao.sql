-- Adiciona o status "Agendado" (entre "Aprovado para publicação" e
-- "Publicado") e o formato "Reunião".
-- ADD VALUE não pode rodar dentro do mesmo bloco de transação em que o valor
-- novo já é usado, mas rodando os comandos separados aqui no SQL Editor cada
-- um comita sozinho, então tá tudo bem.

alter type post_status add value 'Agendado' before 'Publicado';
alter type post_formato add value 'Reunião';

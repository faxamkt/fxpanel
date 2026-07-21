-- Renomeia os status "Copy V4" / "Layout V4" pra "Copy FX" / "Layout FX".
-- RENAME VALUE só troca o rótulo do enum — posts que já estavam com esse
-- status continuam com ele, só muda o nome exibido.

alter type post_status rename value 'Copy V4' to 'Copy FX';
alter type post_status rename value 'Layout V4' to 'Layout FX';

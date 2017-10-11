# Chat demo s RethinkDB a WebSocket

Spustit RethinkDB a [vytvorit](http://localhost:8080) databazi `chat` tabulku
a v ni tabulku `messages`.
 
Spustit backend pomoci prikazu `npm run start` a v prohlizeci otevrit
[http://localhost:3000](http://localhost:3000).

## API nad WebSocket
- Klient odesle zpravu jako serialozovany JSON `{"from": "...", "message": "..."}`.
- Server posila podobny JSON pri kazde nove zprave.
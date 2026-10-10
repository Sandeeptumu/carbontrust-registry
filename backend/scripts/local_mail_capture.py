"""Local-only SMTP capture for disposable integration tests. Never use for real delivery."""
import socketserver,json,email,email.policy,os
class SMTP(socketserver.StreamRequestHandler):
 def send(self,s):self.wfile.write((s+'\r\n').encode());self.wfile.flush()
 def handle(self):
  self.send('220 local test mail capture')
  while line:=self.rfile.readline():
   cmd=line.decode(errors='replace').strip()
   if cmd.upper().startswith('EHLO'):self.send('250-localhost');self.send('250 8BITMIME')
   elif cmd.upper().startswith('HELO'):self.send('250 localhost')
   elif cmd.upper().startswith('DATA'):
    self.send('354 End with dot');lines=[]
    while True:
     l=self.rfile.readline()
     if l in (b'.\r\n',b'.\n',b''):break
     lines.append(l)
    message=email.message_from_bytes(b''.join(lines),policy=email.policy.default)
    with open(os.environ.get('ISOLATED_MAIL_CAPTURE','/tmp/registry-captured-mail.jsonl'),'a') as f:f.write(json.dumps({'to':str(message['To']),'body':message.get_content()})+'\n')
    self.send('250 accepted')
   elif cmd.upper().startswith('QUIT'):self.send('221 bye');break
   else:self.send('250 OK')
class Server(socketserver.ThreadingTCPServer):allow_reuse_address=True
with Server(('127.0.0.1',2528),SMTP) as server:server.serve_forever()

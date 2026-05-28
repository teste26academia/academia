# Segurança da academia

## O que esta fase faz
- regras de acesso do Firestore
- regras de acesso do Storage
- separação de perfis por `role`
- orientação para backup
- checklist antes de liberar aos alunos

## Perfis sugeridos
- `admin`
- `professor`
- `aluno`

## Recomendação de implantação
1. Publique as regras do Firestore.
2. Publique as regras do Storage.
3. Defina um usuário como `admin` no documento `users/{uid}`.
4. Faça backup inicial.
5. Teste com uma conta de aluno separada.

## Observação importante
O frontend não deve ser a única camada de segurança. As regras do Firebase precisam estar ativas para realmente proteger os dados.

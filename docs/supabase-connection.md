# Guide connexion Supabase — corriger l'erreur P1001

## Cause

L'URI directe `db.*.supabase.co:5432` ne résout qu'en **IPv6**.
Beaucoup de réseaux Windows ne supportent pas IPv6 → Prisma affiche **P1001 Can't reach database server**.

## Solution : utiliser le Connection Pooler (IPv4)

1. Ouvre [Supabase Dashboard](https://supabase.com/dashboard) → ton projet
2. Vérifie que le projet n'est **pas en pause** (Restore si besoin)
3. **Project Settings → Database → Connection string**
4. Onglet **ORM** → choisis **Prisma**
5. Copie les 2 URI (Transaction + Session) avec ton mot de passe

Colle-les dans `.env` :

```env
# Transaction mode — port 6543 (DATABASE_URL)
DATABASE_URL="postgresql://postgres.phwmjihqzvtjsbtpmpsk:[PASSWORD]@aws-0-XX.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Session mode — port 5432 (DIRECT_URL, migrations)
DIRECT_URL="postgresql://postgres.phwmjihqzvtjsbtpmpsk:[PASSWORD]@aws-0-XX.pooler.supabase.com:5432/postgres"
```

> Le user est `postgres.phwmjihqzvtjsbtpmpsk` (avec le ref projet), pas juste `postgres`.

6. Encode les caractères spéciaux du mot de passe dans l'URL :
   - `!` → `%21`
   - `@` → `%40`
   - Exemple : `Wassop9898!!` → `Wassop9898%21%21`

7. Lance :

```powershell
cd C:\Users\mhalv\Projects\fleetrent
npm.cmd run db:push
npm.cmd run db:seed
npm.cmd run dev
```

## Vérification rapide

Dans Supabase → Database → **Check connection** ou regarde si le projet affiche "Active".

## Alternative payante

Supabase propose un add-on **IPv4** pour la connexion directe `db.*` — le pooler gratuit suffit pour FleetRent.

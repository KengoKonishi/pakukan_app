# 環境構築
## 事前準備
- Supabaseの`pakukan_app`プロジェクトに参加しておく

## 手順
- supabaseのプロジェクトをローカルに紐付ける
```
supabase link --project-ref yhbeozxybcgzdmccyvzl
```

- db更新(検証のsupabaseの内容をローカルに取り込み)
```
supabase db pull
```

- .env.localの作成
```
cp .env.example .env.local
```

- supabaseをローカルで起動
```
supabase start
```

- .env.localの以下の値を、向き先に応じて書き換える
    - ローカル
        - `supabase start`の実行結果に表示されている`API URL`と`anon key`を参照する
    - 検証
        - Supabaseのプロジェクトの`Project Settings > API`ページの内容で置き換える
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- Next起動
```
npm run dev
```

- テストユーザーでログインできることを確認

# テストユーザー
```
管理者
admin@test.com
password

清掃員
cleaner@test.com
password
```

# Supabaseコマンド
## DB定義をもとにTypeScriptの型を生成
```
supabase gen types typescript --project-id yhbeozxybcgzdmccyvzl > supabase/database.types.ts
```

## DB定義をもとにマイグレーションファイルを生成
```
supabase db pull
```
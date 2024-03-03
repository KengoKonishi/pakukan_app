# 環境構築
## 事前準備
- Supabaseの`pakukan_app`プロジェクトに参加しておく

## 手順
- .env.localの作成
```
cp .env.example .env.local
```

- 以下の値をSupabaseのプロジェクトの`Project Settings > API`ページの内容で置き換える
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- ローカルで起動
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
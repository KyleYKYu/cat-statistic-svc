Example curl:

curl --location 'http://localhost:3000/api/stat/upload-csv' \
--form 'file=@"/Users/yingkityu/Downloads/Results/memoCompletedCalApr2025_ITOCMS-38603_CMSCR1P1_cat_memo.csv"' \
--form 'METRICS="MEMO_CREATE"' \
--form 'YEAR="2025"' \
--form 'MONTH="04"'
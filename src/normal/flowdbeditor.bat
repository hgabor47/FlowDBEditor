# A CHROME ebben az állapotban való indítása után másra ne használjuk ezt a CHROME példányt, mert nyitott a fájlrendszerre
# A többi FORM lekérdezhetõ a címsor kézi átírásával

cmd /C start chrome "file:///%cd%/index.html?file=file:///%cd%/flowdbFEB221102.txt" --allow-file-access-from-files

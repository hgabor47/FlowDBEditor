# A CHROME ebben az �llapotban val� ind�t�sa ut�n m�sra ne haszn�ljuk ezt a CHROME p�ld�nyt, mert nyitott a f�jlrendszerre
# A t�bbi FORM lek�rdezhet� a c�msor k�zi �t�r�s�val

# cmd /C start chrome "file:///%cd%/index.html?file=file:///%cd%/flowdbFEB221102.txt" --allow-file-access-from-files
cmd /C start chrome "file:///%cd%/index.html" --allow-file-access-from-files --disable-permissions-api

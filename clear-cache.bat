@echo off
echo Deleting .next folder...
if exist .next (
    rmdir /s /q .next
    echo .next folder deleted successfully!
) else (
    echo .next folder not found.
)
echo Done!

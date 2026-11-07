using System;
using LMS.Shared.Common.Errors;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace LMS.Shared.ErrorHandling.Translators;

public sealed class SqlServerExceptionTranslator : IDatabaseExceptionTranslator
{
    public bool TryTranslate(Exception exception, out Error error)
    {
        // 1. Optimistic Concurrency Conflicts
        if (exception is DbUpdateConcurrencyException)
        {
            error = Error.Conflict(
                ErrorCode.ConcurrencyConflict,
                "The resource has been modified or deleted by another operation. Please reload and retry.");
            return true;
        }

        // 2. Extract underlying SqlException from EF Core or raw exception
        var sqlException = FindSqlException(exception);
        if (sqlException is not null)
        {
            switch (sqlException.Number)
            {
                // Unique index or unique constraint violation
                case 2601:
                case 2627:
                    error = Error.Conflict(
                        ErrorCode.DomainConflict,
                        "A record with the specified unique values already exists.");
                    return true;

                // Foreign key constraint violation
                case 547:
                    error = Error.BadRequest(
                        ErrorCode.ArgumentInvalid,
                        "The operation failed because a related record required by foreign key constraint does not exist or is currently in use.");
                    return true;

                // Deadlock victim
                case 1205:
                    error = Error.Infrastructure(
                        ErrorCode.DatabaseError,
                        "The database operation encountered a temporary deadlock. Please retry the request.");
                    return true;

                // Connection or network level failure
                case -1:
                case -2:
                case 53:
                    error = Error.Infrastructure(
                        ErrorCode.DatabaseError,
                        "Database connection failed or timed out. Please try again shortly.");
                    return true;
            }
        }

        if (exception is DbUpdateException)
        {
            error = Error.Internal(
                ErrorCode.DatabaseError,
                "A database update error occurred while processing the request.");
            return true;
        }

        error = Error.None;
        return false;
    }

    private static SqlException? FindSqlException(Exception? ex)
    {
        while (ex is not null)
        {
            if (ex is SqlException sqlEx)
            {
                return sqlEx;
            }
            ex = ex.InnerException;
        }
        return null;
    }
}

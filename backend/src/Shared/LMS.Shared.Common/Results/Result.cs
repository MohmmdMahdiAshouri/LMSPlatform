namespace LMS.Shared.Common.Results;

public readonly record struct Result<T>
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public T? Value { get; }
    public Errors.Error? Error { get; }

    private Result(bool isSuccess, T? value, Errors.Error? error)
    {
        if (isSuccess && error is not null)
            throw new InvalidOperationException("Cannot construct a successful Result with an Error.");
        if (!isSuccess && error is null)
            throw new InvalidOperationException("Cannot construct a failed Result without an Error.");
        IsSuccess = isSuccess;
        Value = value;
        Error = error;
    }

    public static Result<T> Success(T value) => new(true, value, null);
    public static Result<T> Failure(Errors.Error error) => new(false, default, error);

    public TResult Match<TResult>(
        Func<T, TResult> onSuccess,
        Func<Errors.Error, TResult> onFailure)
        => IsSuccess ? onSuccess(Value!) : onFailure(Error!);

    public async Task<TResult> MatchAsync<TResult>(
        Func<T, Task<TResult>> onSuccess,
        Func<Errors.Error, Task<TResult>> onFailure)
        => IsSuccess ? await onSuccess(Value!) : await onFailure(Error!);

    public Result<TOut> Map<TOut>(Func<T, TOut> mapper)
        => IsSuccess ? Result<TOut>.Success(mapper(Value!)) : Result<TOut>.Failure(Error!);

    public async Task<Result<TOut>> MapAsync<TOut>(Func<T, Task<TOut>> mapper)
        => IsSuccess ? Result<TOut>.Success(await mapper(Value!)) : Result<TOut>.Failure(Error!);

    public Result<TOut> Bind<TOut>(Func<T, Result<TOut>> binder)
        => IsSuccess ? binder(Value!) : Result<TOut>.Failure(Error!);

    public async Task<Result<TOut>> BindAsync<TOut>(Func<T, Task<Result<TOut>>> binder)
        => IsSuccess ? await binder(Value!) : Result<TOut>.Failure(Error!);

    public Result<T> Ensure(Func<T, bool> predicate, Errors.Error error)
    {
        if (IsFailure) return this;
        return predicate(Value!) ? this : Failure(error);
    }

    public Result<T> Tap(Action<T> action)
    {
        if (IsSuccess)
        {
            action(Value!);
        }
        return this;
    }

    public async Task<Result<T>> TapAsync(Func<T, Task> action)
    {
        if (IsSuccess)
        {
            await action(Value!);
        }
        return this;
    }

    public bool TryGetValue(out T value)
    {
        value = Value!;
        return IsSuccess;
    }

    public static implicit operator Result<T>(T value) => Success(value);
    public static implicit operator Result<T>(Errors.Error error) => Failure(error);
}

public readonly record struct Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public Errors.Error? Error { get; }

    private Result(bool isSuccess, Errors.Error? error)
    {
        if (isSuccess && error is not null)
            throw new InvalidOperationException("Cannot construct a successful Result with an Error.");
        if (!isSuccess && error is null)
            throw new InvalidOperationException("Cannot construct a failed Result without an Error.");
        IsSuccess = isSuccess;
        Error = error;
    }

    public static Result Success() => new(true, null);
    public static Result Failure(Errors.Error error) => new(false, error);

    public static Result<T> Success<T>(T value) => Result<T>.Success(value);
    public static Result<T> Failure<T>(Errors.Error error) => Result<T>.Failure(error);

    public TResult Match<TResult>(
        Func<TResult> onSuccess,
        Func<Errors.Error, TResult> onFailure)
        => IsSuccess ? onSuccess() : onFailure(Error!);

    public async Task<TResult> MatchAsync<TResult>(
        Func<Task<TResult>> onSuccess,
        Func<Errors.Error, Task<TResult>> onFailure)
        => IsSuccess ? await onSuccess() : await onFailure(Error!);

    public Result Ensure(Func<bool> predicate, Errors.Error error)
    {
        if (IsFailure) return this;
        return predicate() ? this : Failure(error);
    }

    public Result Tap(Action action)
    {
        if (IsSuccess)
        {
            action();
        }
        return this;
    }

    public async Task<Result> TapAsync(Func<Task> action)
    {
        if (IsSuccess)
        {
            await action();
        }
        return this;
    }

    public static Result Combine(params Result[] results)
    {
        foreach (var result in results)
        {
            if (result.IsFailure)
            {
                return result;
            }
        }
        return Success();
    }

    public static Result Try(Action action, Func<Exception, Errors.Error>? errorHandler = null)
    {
        try
        {
            action();
            return Success();
        }
        catch (Exception ex)
        {
            var err = errorHandler?.Invoke(ex) ?? Errors.Error.Internal(ex.Message);
            return Failure(err);
        }
    }

    public static Result<T> Try<T>(Func<T> func, Func<Exception, Errors.Error>? errorHandler = null)
    {
        try
        {
            return Success(func());
        }
        catch (Exception ex)
        {
            var err = errorHandler?.Invoke(ex) ?? Errors.Error.Internal(ex.Message);
            return Failure<T>(err);
        }
    }

    public static async Task<Result<T>> TryAsync<T>(Func<Task<T>> func, Func<Exception, Errors.Error>? errorHandler = null)
    {
        try
        {
            var val = await func();
            return Success(val);
        }
        catch (Exception ex)
        {
            var err = errorHandler?.Invoke(ex) ?? Errors.Error.Internal(ex.Message);
            return Failure<T>(err);
        }
    }

    public static implicit operator Result(Errors.Error error) => Failure(error);
}

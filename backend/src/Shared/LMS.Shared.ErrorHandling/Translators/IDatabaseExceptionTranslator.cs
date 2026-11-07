using System;
using LMS.Shared.Common.Errors;

namespace LMS.Shared.ErrorHandling.Translators;

public interface IDatabaseExceptionTranslator
{
    bool TryTranslate(Exception exception, out Error error);
}

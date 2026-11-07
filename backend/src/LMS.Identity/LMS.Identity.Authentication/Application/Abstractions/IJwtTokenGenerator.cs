using LMS.Identity.Authentication.Domain.Entities;

namespace LMS.Identity.Authentication.Application.Abstractions;

public interface IAccessTokenGenerator
{
    string GenerateToken(User user, Session session);
}

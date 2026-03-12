using System.Text.Json;
using Microsoft.AspNetCore.Http;

namespace PetShop.Infrastructure;

public static class SessionExtensions
{
    public static void SetJson<T>(this ISession session, string key, T value)
    {
        var json = JsonSerializer.Serialize(value);
        session.SetString(key, json);
    }

    public static T? GetJson<T>(this ISession session, string key)
    {
        var json = session.GetString(key);
        return string.IsNullOrWhiteSpace(json) ? default : JsonSerializer.Deserialize<T>(json);
    }
}

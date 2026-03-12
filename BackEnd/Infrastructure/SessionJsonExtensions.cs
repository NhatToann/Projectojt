using System.Text.Json;
using Microsoft.AspNetCore.Http;

namespace PetShop.Infrastructure;

public static class SessionJsonExtensions
{
    private static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web);

    public static void SetJson<T>(this ISession session, string key, T value)
    {
        session.SetString(key, JsonSerializer.Serialize(value, Options));
    }

    public static T? GetJson<T>(this ISession session, string key)
    {
        var json = session.GetString(key);
        if (string.IsNullOrWhiteSpace(json)) return default;
        return JsonSerializer.Deserialize<T>(json, Options);
    }
}


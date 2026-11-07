FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy central package management + solution
COPY Directory.Build.props Directory.Packages.props ./
COPY *.slnx ./

# Copy source tree preserving structure
COPY src/ ./src/

# Restore + publish only the API project
RUN dotnet restore src/Bootstrappers/LMS.Api/LMS.Api.csproj
RUN dotnet publish src/Bootstrappers/LMS.Api/LMS.Api.csproj \
    -c Release -o /app/publish --no-restore

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "LMS.Api.dll"]

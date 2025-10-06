FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["TG-MiniApp.csproj", "./"]
RUN dotnet restore "TG-MiniApp.csproj"
COPY . .
RUN dotnet build "TG-MiniApp.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TG-MiniApp.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY app.db .
ENTRYPOINT ["dotnet", "TG-MiniApp.dll"]